/**
 * ============================================
 * Flexible Auth Guard - รองรับทั้ง JWT และ Keycloak
 * ============================================
 * Guard นี้ยอมรับทั้ง JWT token (จาก /auth/login) และ Keycloak token
 * ทำให้สามารถใช้ระบบ authentication 2 แบบพร้อมกันได้
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "../../auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FlexibleAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // ดึง Bearer token จาก header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("No token provided");
    }

    const token = authHeader.substring(7); // ตัด "Bearer " ออก

    // ลอง validate ด้วย JWT ก่อน (จาก /auth/login)
    try {
      const jwtSecret = this.configService.get<string>("JWT_SECRET");
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
      });

      // JWT token ใช้งานได้
      request.user = {
        id: decoded.sub,
        username: decoded.username,
        role: decoded.role,
        source: "jwt", // บอกว่ามาจาก JWT
      };

      return true;
    } catch (jwtError) {
      // JWT ล้มเหลว ลอง validate ด้วย Keycloak
      try {
        const userInfo = await this.authService.validateKeycloakToken(token);

        if (!userInfo) {
          throw new UnauthorizedException(
            "Invalid token (neither JWT nor Keycloak)",
          );
        }

        // หาหรือสร้าง user ในระบบจาก Keycloak user
        const user = await this.authService.findOrCreateKeycloakUser(userInfo);

        // Keycloak token ใช้งานได้
        request.user = {
          id: user.id, // ใช้ user id จากฐานข้อมูล
          username: user.username,
          role: user.role,
          source: "keycloak", // บอกว่ามาจาก Keycloak
          keycloak: true,
        };

        return true;
      } catch (keycloakError) {
        // ทั้ง JWT และ Keycloak ล้มเหลว
        throw new UnauthorizedException(
          "Invalid token (tried both JWT and Keycloak)",
        );
      }
    }
  }
}
