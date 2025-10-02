/**
 * ============================================
 * Reviews DTOs - Data Transfer Objects
 * ============================================
 * กำหนดโครงสร้างข้อมูลและ validation สำหรับ Reviews API
 * ใช้ Zod สำหรับตรวจสอบข้อมูลที่ส่งเข้ามา
 */

import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Schema สำหรับ validation การสร้างรีวิวใหม่
 */
export const createReviewSchema = z.object({
  seriesId: z.coerce.number().int().positive(), // ID ของซีรีส์ที่จะรีวิว (ต้องเป็นจำนวนเต็มบวก)
  score: z.coerce.number().min(1).max(5), // คะแนน (1-5)
  comment: z.string().optional(), // ความคิดเห็น (optional)
});

/**
 * DTO สำหรับสร้างรีวิวใหม่
 * ใช้ใน POST /reviews
 * มี Swagger examples เพื่อให้กรอกข้อมูลง่าย
 */
export class CreateReviewDto extends createZodDto(createReviewSchema) {
  /**
   * ID ของซีรีส์ที่ต้องการรีวิว
   * @example 1
   */
  @ApiProperty({
    description: "ID ของซีรีส์ที่ต้องการรีวิว",
    example: 1,
    minimum: 1,
  })
  seriesId: number;

  /**
   * คะแนนที่ให้ (1-5)
   * @example 4.5
   */
  @ApiProperty({
    description: "คะแนนที่ให้ (1-5)",
    example: 4.5,
    minimum: 1,
    maximum: 5,
  })
  score: number;

  /**
   * ความคิดเห็น/รีวิว (ไม่บังคับ)
   * @example "ซีรีส์ดีมาก! น่าติดตามมาก แนะนำเลยครับ"
   */
  @ApiProperty({
    description: "ความคิดเห็น/รีวิว (ไม่บังคับ)",
    example: "ซีรีส์ดีมาก! น่าติดตามมาก แนะนำเลยครับ",
    required: false,
  })
  comment?: string;
}

/**
 * Schema สำหรับ query parameters ในการดูรายการรีวิว
 */
export const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(), // หน้าที่ (ค่าเริ่มต้น: 1)
  limit: z.coerce.number().int().min(1).max(50).optional(), // จำนวนต่อหน้า (ค่าเริ่มต้น: 10)
});

/**
 * DTO สำหรับ query parameters
 * ใช้ใน GET /series/:id/reviews
 * มี Swagger examples เพื่อให้กรอกข้อมูลง่าย
 */
export class ListReviewsQueryDto extends createZodDto(listReviewsQuerySchema) {
  /**
   * หน้าที่ต้องการดู (เริ่มจาก 1)
   * @example 1
   */
  @ApiProperty({
    description: "หน้าที่ต้องการดู (เริ่มจาก 1)",
    example: 1,
    required: false,
    minimum: 1,
  })
  page?: number;

  /**
   * จำนวนรายการต่อหน้า (สูงสุด 50)
   * @example 10
   */
  @ApiProperty({
    description: "จำนวนรายการต่อหน้า (สูงสุด 50)",
    example: 10,
    required: false,
    minimum: 1,
    maximum: 50,
  })
  limit?: number;
}

/**
 * Type สำหรับ TypeScript
 */
export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;
