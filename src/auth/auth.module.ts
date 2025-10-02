/**
 * ============================================
 * Auth Module - โมดูลจัดการ Authentication
 * ============================================
 * โมดูลสำหรับจัดการการสมัครสมาชิก, เข้าสู่ระบบ, และ JWT
 */

import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { RefreshJwtStrategy } from "./strategies/refresh.strategy";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    UsersModule, // ต้องใช้ UsersService สำหรับจัดการข้อมูลผู้ใช้
    PassportModule, // เพื่อใช้งาน Passport authentication
    JwtModule.register({}), // JWT service สำหรับสร้างและตรวจสอบ token
    ConfigModule, // เพื่อเข้าถึงตัวแปรจาก .env
  ],
  providers: [
    AuthService, // Service สำหรับ logic การ authentication
    JwtStrategy, // Strategy สำหรับตรวจสอบ access token
    RefreshJwtStrategy, // Strategy สำหรับตรวจสอบ refresh token
  ],
  controllers: [AuthController], // Controller สำหรับรับ API requests
  exports: [AuthService], // export AuthService เพื่อให้โมดูลอื่นใช้งานได้
})
export class AuthModule {}
