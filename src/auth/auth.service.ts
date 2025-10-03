/**
 * ============================================
 * Auth Service - Service สำหรับ Authentication
 * ============================================
 * จัดการ logic ทั้งหมดของระบบ authentication
 * - สมัครสมาชิก
 * - เข้าสู่ระบบ
 * - สร้าง JWT tokens
 * - Refresh tokens
 */

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService, // Service สำหรับจัดการ users
    private readonly jwt: JwtService, // Service สำหรับ JWT
    private readonly config: ConfigService, // Service สำหรับอ่าน config
  ) {}

  /**
   * สมัครสมาชิกใหม่
   * @param username - ชื่อผู้ใช้ (ต้องไม่ซ้ำกัน)
   * @param password - รหัสผ่าน (จะถูก hash ก่อนบันทึก)
   * @returns User object โดยไม่มี password
   */
  async register(username: string, password: string) {
    // ตรวจสอบว่า username ซ้ำหรือไม่
    const existing = await this.users.findByUsername(username);
    if (existing) {
      throw new ConflictException("Username already taken");
    }

    // Hash password ด้วย bcrypt (salt rounds = 10)
    const hash = await bcrypt.hash(password, 10);

    // สร้าง user ใหม่ใน database
    const created = await this.users.create({ username, password: hash });

    // ลบ password ออกจาก response เพื่อความปลอดภัย
    const safeUser = { ...created } as any;
    delete safeUser.password;

    return safeUser;
  }

  /**
   * ตรวจสอบความถูกต้องของ username และ password
   * @param username - ชื่อผู้ใช้
   * @param password - รหัสผ่านที่ยังไม่ได้ hash
   * @returns User object ถ้าถูกต้อง, null ถ้าผิด
   */
  async validateUser(username: string, password: string) {
    // ค้นหา user จาก username
    const user = await this.users.findByUsername(username);
    if (!user) return null;

    // เปรียบเทียบ password ที่กรอกเข้ามากับ hash ใน database
    const ok = await bcrypt.compare(password, user.password);

    return ok ? user : null;
  }

  /**
   * เข้าสู่ระบบ และสร้าง access token + refresh token
   * @param username - ชื่อผู้ใช้
   * @param password - รหัสผ่าน
   * @returns { accessToken, refreshToken, expiresIn }
   */
  async login(username: string, password: string) {
    // ตรวจสอบความถูกต้องของ credentials
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // สร้าง payload สำหรับ JWT
    const payload = {
      sub: user.id, // User ID
      username: user.username,
      role: user.role, // สิทธิ์ (USER, ADMIN)
    };

    // อ่าน secrets และเวลา expire จาก .env
    const accessSecret = this.config.get<string>("JWT_SECRET") || "dev-secret";
    const refreshSecret =
      this.config.get<string>("REFRESH_JWT_SECRET") || "dev-refresh-secret";
    const accessExpires = this.config.get<string>("JWT_EXPIRES_IN") || "3600s";
    const refreshExpires =
      this.config.get<string>("REFRESH_JWT_EXPIRES_IN") || "7d";

    // สร้าง access token (ใช้สำหรับ API calls ที่ต้อง authenticate)
    const accessToken = await this.jwt.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessExpires,
    });

    // สร้าง refresh token (ใช้สำหรับขอ access token ใหม่เมื่อหมดอายุ)
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpires,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpires,
    };
  }

  /**
   * Refresh access token โดยใช้ refresh token
   * @param refreshToken - Refresh token ที่ได้จากการ login
   * @returns { accessToken, refreshToken } - Tokens ใหม่
   */
  async refresh(refreshToken: string) {
    try {
      // อ่าน secrets จาก config
      const refreshSecret =
        this.config.get<string>("REFRESH_JWT_SECRET") || "dev-refresh-secret";
      const accessSecret =
        this.config.get<string>("JWT_SECRET") || "dev-secret";
      const accessExpires =
        this.config.get<string>("JWT_EXPIRES_IN") || "3600s";
      const refreshExpires =
        this.config.get<string>("REFRESH_JWT_EXPIRES_IN") || "7d";

      // ตรวจสอบ refresh token และ decode ข้อมูล
      const decoded = await this.jwt.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });

      // สร้าง payload จากข้อมูลที่ decode ได้
      const payload = {
        sub: decoded.sub,
        username: decoded.username,
        role: decoded.role,
      };

      // สร้าง access token ใหม่
      const accessToken = await this.jwt.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpires,
      });

      // สร้าง refresh token ใหม่เพื่อยืดอายุการใช้งาน
      const newRefreshToken = await this.jwt.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpires,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      // ถ้า refresh token ไม่ถูกต้องหรือหมดอายุ แจ้ง error
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  /**
   * ============================================
   * Keycloak Integration (Bonus Feature)
   * ============================================
   */

  /**
   * สร้าง Keycloak authorization URL สำหรับ redirect user ไป login
   * @returns Authorization URL พร้อม query parameters
   */
  getKeycloakAuthUrl(): string {
    const authServerUrl = this.config.get<string>("KEYCLOAK_AUTH_SERVER_URL");
    const realm = this.config.get<string>("KEYCLOAK_REALM");
    const clientId = this.config.get<string>("KEYCLOAK_CLIENT_ID");

    const redirectUri = `${this.config.get<string>("APP_URL") || "http://localhost:3000"}/auth/keycloak/callback`;

    const params = new URLSearchParams();
    params.append("client_id", clientId || "");
    params.append("redirect_uri", redirectUri);
    params.append("response_type", "code");
    params.append("scope", "openid profile email");

    return `${authServerUrl}/realms/${realm}/protocol/openid-connect/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code สำหรับ access token จาก Keycloak
   * @param code - Authorization code จาก callback
   * @returns Token response จาก Keycloak
   */
  async exchangeKeycloakCode(code: string) {
    const authServerUrl = this.config.get<string>("KEYCLOAK_AUTH_SERVER_URL");
    const realm = this.config.get<string>("KEYCLOAK_REALM");
    const clientId = this.config.get<string>("KEYCLOAK_CLIENT_ID");
    const clientSecret = this.config.get<string>("KEYCLOAK_CLIENT_SECRET");

    const redirectUri = `${this.config.get<string>("APP_URL") || "http://localhost:3000"}/auth/keycloak/callback`;

    const tokenUrl = `${authServerUrl}/realms/${realm}/protocol/openid-connect/token`;

    try {
      const params = new URLSearchParams();
      params.append("grant_type", "authorization_code");
      params.append("code", code);
      params.append("redirect_uri", redirectUri);
      params.append("client_id", clientId || "");
      params.append("client_secret", clientSecret || "");

      const response = await axios.post(tokenUrl, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return response.data;
    } catch (error) {
      throw new UnauthorizedException("Failed to exchange code for token");
    }
  }

  /**
   * ดึงข้อมูล user จาก Keycloak access token
   * @param accessToken - Keycloak access token
   * @returns User info จาก Keycloak
   */
  async getKeycloakUserInfo(accessToken: string) {
    const authServerUrl = this.config.get<string>("KEYCLOAK_AUTH_SERVER_URL");
    const realm = this.config.get<string>("KEYCLOAK_REALM");

    const userInfoUrl = `${authServerUrl}/realms/${realm}/protocol/openid-connect/userinfo`;

    try {
      const response = await axios.get(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new UnauthorizedException("Failed to get user info from Keycloak");
    }
  }

  /**
   * Validate Keycloak token
   * @param token - Access token จาก Keycloak
   * @returns User info ถ้า token ถูกต้อง
   */
  async validateKeycloakToken(token: string) {
    try {
      const userInfo = await this.getKeycloakUserInfo(token);
      return userInfo;
    } catch {
      return null;
    }
  }
}
