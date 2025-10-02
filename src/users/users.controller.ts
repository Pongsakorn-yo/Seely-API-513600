/**
 * ============================================
 * Users Controller - จัดการ API endpoints
 * ============================================
 * จัดการ HTTP requests สำหรับ user management
 * - POST /users - สร้าง user ใหม่ (admin only)
 * - GET /users/me - ดูข้อมูลตัวเอง
 */

import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags, ApiProperty } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import * as bcrypt from "bcrypt";
import { Role } from "./entities/user.entity";

/**
 * Schema สำหรับสร้าง user ใหม่
 */
const createUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

/**
 * DTO สำหรับสร้าง user
 */
class CreateUserDto extends createZodDto(createUserSchema) {
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

  /**
   * บทบาท (USER หรือ ADMIN)
   * @example "USER"
   */
  @ApiProperty({
    description: "บทบาทของผู้ใช้",
    example: "USER",
    enum: ["USER", "ADMIN"],
    required: false,
  })
  role?: "USER" | "ADMIN";
}

/**
 * Controller สำหรับ User endpoints
 */
@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /users
   * สร้าง user ใหม่ในระบบ
   * ต้อง login และเป็น ADMIN เท่านั้น
   *
   * @param dto - ข้อมูล user { username, password, role? }
   * @returns User object (ไม่มี password)
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Post()
  async createUser(@Body() dto: CreateUserDto, @Req() req: any) {
    // ตรวจสอบว่าผู้ใช้ที่ login เป็น ADMIN หรือไม่
    if (req.user.role !== "ADMIN") {
      throw new ForbiddenException("Only admins can create users");
    }

    // Hash password ก่อนบันทึก
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // สร้าง user
    const user = await this.usersService.create({
      username: dto.username,
      password: hashedPassword,
      role: (dto.role as Role) || "USER",
    });

    // Return โดยไม่แสดง password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  /**
   * GET /users/me
   * ดูข้อมูลผู้ใช้ตัวเอง (จาก JWT token)
   * ต้อง login
   *
   * @param req - Request object ที่มี user data จาก JWT
   * @returns User object (ไม่มี password)
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  async getMe(@Req() req: any) {
    // ดึง user ID จาก JWT payload
    const userId = req.user.sub;

    // ค้นหา user จาก database
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new ForbiddenException("User not found");
    }

    // Return โดยไม่แสดง password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
