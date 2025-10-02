/**
 * ============================================
 * JWT Strategy - การตรวจสอบ Access Token
 * ============================================
 * ใช้สำหรับตรวจสอบ JWT access token
 * จาก Authorization header (Bearer token)
 */

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

/**
 * JWT Strategy สำหรับ access token
 * ใช้ร่วมกับ @UseGuards(JwtAuthGuard) ใน controllers
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(config: ConfigService) {
    super({
      // ดึง JWT จาก Authorization header: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // ไม่ยอมรับ token ที่หมดอายุ
      ignoreExpiration: false,

      // Secret key สำหรับตรวจสอบ token
      secretOrKey: config.get("JWT_SECRET") || "dev-secret",
    });
  }

  /**
   * ฟังก์ชันนี้จะถูกเรียกหลังจาก token ถูก decode
   * ค่าที่ return จะถูกใส่ใน req.user
   * @param payload - ข้อมูลจาก JWT payload
   * @returns User object ที่จะถูกเก็บไว้ใน request
   */
  async validate(payload: any) {
    return {
      sub: payload.sub, // User ID
      username: payload.username,
      role: payload.role, // สิทธิ์ (USER, ADMIN)
    };
  }
}
