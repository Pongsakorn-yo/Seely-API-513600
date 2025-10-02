/**
 * ============================================
 * Data Source Configuration
 * ============================================
 * ไฟล์สำหรับตั้งค่าการเชื่อมต่อ database
 * รองรับทั้ง PostgreSQL และ SQLite
 */

import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

// Import Entity ทั้งหมดที่ใช้ในระบบ
import { User } from "./users/entities/user.entity";
import { Series } from "./series/entities/series.entity";
import { Review } from "./reviews/entities/review.entity";

// โหลดค่าตัวแปรจาก .env file
ConfigModule.forRoot();
const config = new ConfigService();
const databaseUrl = config.get<string>("DATABASE_URL");

/**
 * รายการ Entity ทั้งหมดที่ TypeORM จะต้องจัดการ
 * Entity คือ Class ที่แทนตารางใน database
 */
const entities = [User, Series, Review];

/**
 * การตั้งค่าทั่วไปสำหรับ database
 * ใช้ร่วมกันทั้ง PostgreSQL และ SQLite
 */
const commonOptions = {
  entities, // รายการ Entity ทั้งหมด

  // synchronize: true จะสร้าง/อัปเดตตารางอัตโนมัติ
  // ⚠️ ใช้ได้เฉพาะใน Development เท่านั้น!
  // ใน Production ควรใช้ migrations แทน
  synchronize: true,

  // logging: true จะแสดง SQL queries ทั้งหมดใน console
  // เป็นประโยชน์สำหรับ debug
  logging: true,

  // การตั้งค่าสำหรับ migrations (ใช้ใน Production)
  migrations: ["dist/migrations/*.js"],
  migrationsTableName: "migrations",
};

/**
 * ตัวเลือกการเชื่อมต่อ database
 * - ถ้ามี DATABASE_URL จะใช้ PostgreSQL
 * - ถ้าไม่มีจะใช้ SQLite สำหรับ development
 */
export const dataSourceOptions: DataSourceOptions = databaseUrl
  ? {
      // การตั้งค่าสำหรับ PostgreSQL
      type: "postgres",
      url: databaseUrl, // Connection string จาก .env

      // ตั้งค่า SSL สำหรับ Production (เช่น Heroku, Railway)
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,

      ...commonOptions,
    }
  : {
      // การตั้งค่าสำหรับ SQLite (Development)
      type: "sqlite",
      database: "seely-dev.sqlite", // ไฟล์ database

      ...commonOptions,
    };

/**
 * สร้าง Data Source สำหรับการทำงานกับ CLI
 * (เช่น การรัน migrations)
 */
export const AppDataSource = new DataSource(dataSourceOptions);
