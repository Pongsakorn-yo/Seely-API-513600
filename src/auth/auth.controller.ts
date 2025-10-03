/**
 * ============================================
 * Auth Controller - จัดการ API endpoints
 * ============================================
 * จัดการ HTTP requests สำหรับ authentication
 * - POST /auth/register - สมัครสมาชิก
 * - POST /auth/login - เข้าสู่ระบบ
 * - POST /auth/refresh - Refresh token
 */

import { Body, Controller, Post, Get, Res, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import {
  ApiTags,
  ApiProperty,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { Response } from "express";
import { KeycloakCallbackQueryDto } from "./dto/keycloak.dto";

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

  /**
   * ============================================
   * Keycloak Integration Endpoints (Bonus)
   * ============================================
   */

  /**
   * GET /auth/keycloak/login
   * Redirect user ไปยัง Keycloak login page
   * @param res - Express response object
   */
  @Get("keycloak/login")
  @ApiOperation({
    summary: "Login with Keycloak (SSO)",
    description:
      "Redirect ไปยังหน้า login ของ Keycloak สำหรับ OAuth2/OpenID Connect authentication",
  })
  @ApiResponse({
    status: 302,
    description: "Redirect to Keycloak login page",
  })
  @ApiResponse({
    status: 500,
    description: "Keycloak server error",
  })
  keycloakLogin(@Res() res: Response) {
    const authUrl = this.auth.getKeycloakAuthUrl();
    return res.redirect(authUrl);
  }

  /**
   * GET /auth/keycloak/callback
   * Callback endpoint หลังจาก user login ที่ Keycloak สำเร็จ
   * @param query - { code } - Authorization code จาก Keycloak
   * @returns Token response และ user info
   */
  @Get("keycloak/callback")
  @ApiOperation({
    summary: "Keycloak OAuth2 Callback",
    description:
      "รับ authorization code จาก Keycloak หลัง login สำเร็จ และแลกเป็น access token",
  })
  @ApiQuery({
    name: "code",
    required: true,
    description: "Authorization code จาก Keycloak",
    example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  })
  @ApiQuery({
    name: "state",
    required: false,
    description: "State parameter สำหรับ CSRF protection",
    example: "xyz123",
  })
  @ApiResponse({
    status: 200,
    description: "Login สำเร็จ - ส่งคืน tokens และข้อมูล user",
    schema: {
      example: {
        message: "Login with Keycloak successful",
        tokens: {
          access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
          expires_in: 300,
          refresh_expires_in: 1800,
          refresh_token: "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
          token_type: "Bearer",
          scope: "openid profile email",
        },
        user: {
          sub: "6d279fea-07fd-4af1-869c-a138b2b1cf43",
          email_verified: false,
          name: "test test",
          preferred_username: "testuser",
          given_name: "test",
          family_name: "test",
          email: "test@example.com",
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Authorization code ไม่ถูกต้องหรือหมดอายุ",
  })
  @ApiResponse({
    status: 500,
    description: "Keycloak server error",
  })
  async keycloakCallback(@Query() query: KeycloakCallbackQueryDto) {
    // Exchange authorization code สำหรับ tokens
    const tokenResponse = await this.auth.exchangeKeycloakCode(query.code);

    // ดึงข้อมูล user จาก access token
    const userInfo = await this.auth.getKeycloakUserInfo(
      tokenResponse.access_token,
    );

    return {
      message: "Login with Keycloak successful",
      tokens: tokenResponse,
      user: userInfo,
    };
  }
}
