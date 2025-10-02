/**
 * ============================================
 * Refresh JWT Strategy - การตรวจสอบ Refresh Token
 * ============================================
 * ใช้สำหรับตรวจสอบ JWT refresh token
 * สำหรับขอ access token ใหม่เมื่อหมดอายุ
 */

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

/**
 * Refresh Strategy สำหรับ refresh token
 * ใช้ secret key ต่างจาก JWT Strategy
 */
@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, "refresh") {
  constructor(config: ConfigService) {
    super({
      // ดึง refresh token จาก Authorization header: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // ไม่ยอมรับ token ที่หมดอายุ
      ignoreExpiration: false,

      // Secret key สำหรับ refresh token (ต่างจาก access token)
      secretOrKey: config.get("REFRESH_JWT_SECRET") || "dev-refresh-secret",
    });
  }

  /**
   * ตรวจสอบและ decode refresh token
   * @param payload - ข้อมูลจาก JWT payload
   * @returns User object จาก token
   */
  async validate(payload: any) {
    return {
      sub: payload.sub, // User ID
      username: payload.username,
      role: payload.role, // สิทธิ์ (USER, ADMIN)
    };
  }
}
