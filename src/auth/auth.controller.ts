/**
 * ============================================
 * Auth Controller - จัดการ API endpoints
 * ============================================
 * จัดการ HTTP requests สำหรับ authentication
 * - POST /auth/register - สมัครสมาชิก
 * - POST /auth/login - เข้าสู่ระบบ
 * - POST /auth/refresh - Refresh token
 */

import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiTags, ApiProperty } from "@nestjs/swagger";

/**
 * Schema สำหรับ validation ข้อมูลการสมัครสมาชิก
 * - username: อย่างน้อย 3 ตัวอักษร
 * - password: อย่างน้อย 6 ตัวอักษร
 */
const RegisterSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

/**
 * DTO สำหรับการสมัครสมาชิก
 * มี Swagger examples เพื่อให้กรอกข้อมูลง่าย
 */
class RegisterDto extends createZodDto(RegisterSchema) {
  /**
   * ชื่อผู้ใช้ (อย่างน้อย 3 ตัวอักษร)
   * @example "john_doe"
   */
  @ApiProperty({
    description: "ชื่อผู้ใช้ (อย่างน้อย 3 ตัวอักษร)",
    example: "john_doe",
    minLength: 3,
  })
  username: string;

  /**
   * รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
   * @example "password123"
   */
  @ApiProperty({
    description: "รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)",
    example: "password123",
    minLength: 6,
  })
  password: string;
}

/**
 * Schema สำหรับ validation ข้อมูลการเข้าสู่ระบบ
 */
const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

/**
 * DTO สำหรับการเข้าสู่ระบบ
 * มี Swagger examples เพื่อให้กรอกข้อมูลง่าย
 */
class LoginDto extends createZodDto(LoginSchema) {
  /**
   * ชื่อผู้ใช้
   * @example "john_doe"
   */
  @ApiProperty({
    description: "ชื่อผู้ใช้",
    example: "john_doe",
  })
  username: string;

  /**
   * รหัสผ่าน
   * @example "password123"
   */
  @ApiProperty({
    description: "รหัสผ่าน",
    example: "password123",
  })
  password: string;
}

/**
 * Schema สำหรับ validation refresh token
 */
const RefreshSchema = z.object({
  refreshToken: z.string().min(10),
});

/**
 * DTO สำหรับการ refresh token
 * มี Swagger examples เพื่อให้กรอกข้อมูลง่าย
 */
class RefreshDto extends createZodDto(RefreshSchema) {
  /**
   * Refresh token ที่ได้จากการ login
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  @ApiProperty({
    description: "Refresh token ที่ได้จากการ login",
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiam9obl9kb2UiLCJpYXQiOjE2OTQ3MDAwMDAsImV4cCI6MTY5NTMwNDgwMH0.xyz123",
    minLength: 10,
  })
  refreshToken: string;
}

/**
 * Controller สำหรับ Authentication endpoints
 * @ApiTags - จัดกลุ่มใน Swagger UI
 */
@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /**
   * POST /auth/register
   * สมัครสมาชิกใหม่
   * @param dto - { username, password }
   * @returns User object (ไม่มี password)
   */
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.username, dto.password);
  }

  /**
   * POST /auth/login
   * เข้าสู่ระบบและรับ tokens
   * @param dto - { username, password }
   * @returns { accessToken, refreshToken, expiresIn }
   */
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.username, dto.password);
  }

  /**
   * POST /auth/refresh
   * ขอ access token ใหม่โดยใช้ refresh token
   * @param dto - { refreshToken }
   * @returns { accessToken, refreshToken }
   */
  @Post("refresh")
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }
}
