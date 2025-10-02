/**
 * ============================================
 * Reviews Module
 * ============================================
 * โมดูลจัดการรีวิวและคะแนนของซีรีส์
 * ผู้ใช้สามารถให้คะแนนและแสดงความคิดเห็นได้
 */

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Review } from "./entities/review.entity";
import { ReviewsService } from "./reviews.service";
import { ReviewsController } from "./reviews.controller";
import { Series } from "../series/entities/series.entity";

/**
 * Reviews Module
 * นำเข้า: Review entity และ Series entity สำหรับตรวจสอบว่าซีรีส์มีอยู่จริง
 * Providers: ReviewsService สำหรับ business logic
 * Controllers: ReviewsController สำหรับ HTTP endpoints
 */
@Module({
  imports: [TypeOrmModule.forFeature([Review, Series])],
  providers: [ReviewsService],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
