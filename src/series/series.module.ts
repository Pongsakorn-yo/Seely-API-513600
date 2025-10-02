/**
 * ============================================
 * Series Module - โมดูลจัดการข้อมูลซีรีส์
 * ============================================
 * โมดูลสำหรับจัดการข้อมูลซีรีส์ที่ผู้ใช้แนะนำ
 * - ดูรายการซีรีส์ (ทุกคนเข้าถึงได้)
 * - เพิ่ม/แก้ไข/ลบซีรีส์ (เจ้าของเท่านั้น)
 * - ค้นหาและกรองซีรีส์
 */

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Series } from "./entities/series.entity";
import { SeriesService } from "./series.service";
import { SeriesController } from "./series.controller";
import { OwnershipGuard } from "../common/guards/ownership.guard";

@Module({
  imports: [
    // ลงทะเบียน Series entity กับ TypeORM
    TypeOrmModule.forFeature([Series]),
  ],
  providers: [
    SeriesService, // Service สำหรับ business logic
    OwnershipGuard, // Guard สำหรับตรวจสอบเจ้าของ (ใช้ใน update/delete)
  ],
  controllers: [SeriesController], // Controller สำหรับ API endpoints
  exports: [SeriesService], // Export เพื่อให้โมดูลอื่นใช้งานได้
})
export class SeriesModule {}
