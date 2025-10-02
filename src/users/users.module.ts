/**
 * ============================================
 * Users Module - โมดูลจัดการผู้ใช้งาน
 * ============================================
 * โมดูลสำหรับจัดการข้อมูลผู้ใช้งานในระบบ
 * ใช้ร่วมกับ Auth Module สำหรับ authentication
 */

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";

@Module({
  imports: [
    // ลงทะเบียน User entity กับ TypeORM
    // ทำให้สามารถใช้ Repository ใน UsersService ได้
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [
    UsersController, // Controller สำหรับ HTTP endpoints
  ],
  providers: [
    UsersService, // Service สำหรับจัดการ CRUD operations
  ],
  exports: [
    UsersService, // Export เพื่อให้โมดูลอื่นใช้งานได้ (เช่น AuthModule)
  ],
})
export class UsersModule {}
