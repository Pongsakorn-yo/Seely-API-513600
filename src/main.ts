/**
 * ============================================
 * Seely API - Main Application Entry Point
 * ============================================
 * ไฟล์หลักสำหรับเริ่มต้นแอปพลิเคชัน NestJS
 * รวมการตั้งค่า Swagger, Validation และ Configuration
 */

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import { ConfigService } from "@nestjs/config";

/**
 * ฟังก์ชันหลักสำหรับเริ่มต้นแอปพลิเคชัน
 * ทำการตั้งค่าทั้งหมดและเริ่มรัน server
 */
async function bootstrap() {
  // สร้าง NestJS application instance
  const app = await NestFactory.create(AppModule);

  // ตั้งค่า global prefix สำหรับ API ทั้งหมด (เช่น /api/v1/...)
  app.setGlobalPrefix("api/v1");

  // เปิดใช้งาน Zod Validation Pipe สำหรับตรวจสอบข้อมูลอัตโนมัติ
  app.useGlobalPipes(new ZodValidationPipe());

  // ============================================
  // ตั้งค่า Swagger API Documentation
  // ============================================
  const config = new DocumentBuilder()
    .setTitle("Seely API") // ชื่อ API
    .setDescription("Community series recommendations and reviews") // คำอธิบาย
    .setVersion("0.1.0") // เวอร์ชัน
    .addBearerAuth() // เปิดใช้งาน JWT Authentication ใน Swagger UI
    .build();

  // สร้าง Swagger document จาก configuration
  const document = SwaggerModule.createDocument(app, config);

  // ตั้งค่าเส้นทาง /api สำหรับเข้าถึง Swagger UI
  SwaggerModule.setup("api", app, document);

  // ============================================
  // เริ่มต้น Server
  // ============================================
  const cfg = app.get(ConfigService);
  const port = cfg.get("PORT") || 3000; // ใช้ port จาก .env หรือค่าเริ่มต้น 3000

  // เริ่มรัน server
  await app.listen(port);

  // แสดงข้อความเมื่อเริ่มต้นสำเร็จ
  console.log(`\n🚀 Seely API running on http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api\n`);
}

// เรียกใช้ฟังก์ชัน bootstrap เพื่อเริ่มแอปพลิเคชัน
bootstrap();
