/**
 * ============================================
 * App Module - โมดูลหลักของแอปพลิเคชัน
 * ============================================
 * รวมการตั้งค่าและ import โมดูลทั้งหมดของแอปพลิเคชัน
 */

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { dataSourceOptions } from "./data-source";

// Import โมดูลต่างๆ ของแอปพลิเคชัน
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { SeriesModule } from "./series/series.module";
import { ReviewsModule } from "./reviews/reviews.module";

/**
 * @Module - Decorator สำหรับกำหนด metadata ของโมดูล
 * imports: รายการโมดูลที่ต้องการใช้งาน
 */
@Module({
  imports: [
    // ตั้งค่า ConfigModule เป็น global เพื่อให้ทุกโมดูลเข้าถึงตัวแปรจาก .env ได้
    ConfigModule.forRoot({ isGlobal: true }),

    // ตั้งค่า TypeORM สำหรับเชื่อมต่อ database
    TypeOrmModule.forRoot(dataSourceOptions),

    // โมดูลสำหรับจัดการ Authentication และ Authorization
    AuthModule,

    // โมดูลสำหรับจัดการข้อมูลผู้ใช้งาน
    UsersModule,

    // โมดูลสำหรับจัดการข้อมูลซีรีส์
    SeriesModule,

    // โมดูลสำหรับจัดการรีวิวและคะแนน
    ReviewsModule,
  ],
})
export class AppModule {}
