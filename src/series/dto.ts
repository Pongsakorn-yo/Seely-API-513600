/**
 * ============================================
 * Series DTOs - Data Transfer Objects
 * ============================================
 * กำหนดโครงสร้างข้อมูลและ validation สำหรับ Series API
 * ใช้ Zod สำหรับตรวจสอบข้อมูลที่ส่งเข้ามา
 */

import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Enum สำหรับกำหนด rating code ของซีรีส์
 * - ส = สำหรับทุกคน
 * - ท = ทั่วไป
 * - น13+ = เยาวชน 13 ปีขึ้นไป
 * - น15+ = เยาวชน 15 ปีขึ้นไป
 * - น18+ = ผู้ใหญ่ 18 ปีขึ้นไป
 * - ฉ 20+ = ผู้ใหญ่ 20 ปีขึ้นไป
 */
export const ratingEnum = z.enum(["ส", "ท", "น13+", "น15+", "น18+", "ฉ20+"]);

/**
 * Schema สำหรับ validation การสร้างซีรีส์ใหม่
 */
export const createSeriesSchema = z.object({
  title: z.string().min(1), // ชื่อซีรีส์ (ต้องไม่ว่าง)
  year: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1), // ปีที่ออก
  reviewDetail: z.string().min(1), // รายละเอียด/รีวิว
  recommenderScore: z.coerce.number().min(0).max(5), // คะแนนจากผู้แนะนำ (0-5)
  ratingCode: ratingEnum, // Rating code
});

/**
 * DTO สำหรับสร้างซีรีส์ใหม่
 * ใช้ใน POST /series
 * มี Swagger examples เพื่อให้กรอกข้อมูลง่าย
 */
export class CreateSeriesDto extends createZodDto(createSeriesSchema) {
  /**
   * ชื่อซีรีส์
   * @example "Breaking Bad"
   */
  @ApiProperty({
    description: "ชื่อซีรีส์",
    example: "Breaking Bad",
    minLength: 1,
  })
  title: string;

  /**
   * ปีที่ออกอากาศ
   * @example 2008
   */
  @ApiProperty({
    description: "ปีที่ออกอากาศ",
    example: 2008,
    minimum: 1900,
    maximum: new Date().getFullYear() + 1,
  })
  year: number;

  /**
   * รายละเอียด/รีวิวของซีรีส์
   * @example "เรื่องราวของครูเคมีที่กลายเป็นเจ้าพ่อยาเสพติด ซีรีส์ที่ได้รับคำชมมากที่สุดเรื่องหนึ่ง"
   */
  @ApiProperty({
    description: "รายละเอียด/รีวิวของซีรีส์",
    example:
      "เรื่องราวของครูเคมีที่กลายเป็นเจ้าพ่อยาเสพติด ซีรีส์ที่ได้รับคำชมมากที่สุดเรื่องหนึ่ง",
    minLength: 1,
  })
  reviewDetail: string;

  /**
   * คะแนนแนะนำจากผู้รีวิว (0-5)
   * @example 5
   */
  @ApiProperty({
    description: "คะแนนแนะนำจากผู้รีวิว (0-5)",
    example: 5,
    minimum: 0,
    maximum: 5,
  })
  recommenderScore: number;

  /**
   * Rating code (ส, ท, น13+, น15+, น18+, ฉ20+)
   * @example "น18+"
   */
  @ApiProperty({
    description:
      "Rating code (ส=ทุกคน, ท=ทั่วไป, น13+=13ปีขึ้นไป, น15+=15ปีขึ้นไป, น18+=18ปีขึ้นไป, ฉ20+=20ปีขึ้นไป)",
    example: "น18+",
    enum: ["ส", "ท", "น13+", "น15+", "น18+", "ฉ20+"],
  })
  ratingCode: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+";
}

/**
 * Schema สำหรับ validation การอัปเดตซีรีส์
 * ทุกฟิลด์เป็น optional (.partial())
 */
export const updateSeriesSchema = createSeriesSchema.partial();

/**
 * DTO สำหรับอัปเดตซีรีส์
 * ใช้ใน PATCH /series/:id
 * มี Swagger examples เพื่อให้กรอกข้อมูลง่าย
 */
export class UpdateSeriesDto extends createZodDto(updateSeriesSchema) {
  /**
   * ชื่อซีรีส์ (optional)
   * @example "Breaking Bad: The Complete Series"
   */
  @ApiProperty({
    description: "ชื่อซีรีส์",
    example: "Breaking Bad: The Complete Series",
    required: false,
    minLength: 1,
  })
  title?: string;

  /**
   * ปีที่ออกอากาศ (optional)
   * @example 2008
   */
  @ApiProperty({
    description: "ปีที่ออกอากาศ",
    example: 2008,
    required: false,
    minimum: 1900,
    maximum: new Date().getFullYear() + 1,
  })
  year?: number;

  /**
   * รายละเอียด/รีวิวของซีรีส์ (optional)
   * @example "ซีรีส์คลาสสิกที่ทุกคนต้องดู!"
   */
  @ApiProperty({
    description: "รายละเอียด/รีวิวของซีรีส์",
    example: "ซีรีส์คลาสสิกที่ทุกคนต้องดู! อัปเดตรีวิวใหม่",
    required: false,
    minLength: 1,
  })
  reviewDetail?: string;

  /**
   * คะแนนแนะนำจากผู้รีวิว (0-5) (optional)
   * @example 4.8
   */
  @ApiProperty({
    description: "คะแนนแนะนำจากผู้รีวิว (0-5)",
    example: 4.8,
    required: false,
    minimum: 0,
    maximum: 5,
  })
  recommenderScore?: number;

  /**
   * Rating code (optional)
   * @example "น18+"
   */
  @ApiProperty({
    description:
      "Rating code (ส=ทุกคน, ท=ทั่วไป, น13+=13ปีขึ้นไป, น15+=15ปีขึ้นไป, น18+=18ปีขึ้นไป, ฉ20+=20ปีขึ้นไป)",
    example: "น18+",
    required: false,
    enum: ["ส", "ท", "น13+", "น15+", "น18+", "ฉ20+"],
  })
  ratingCode?: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+";
}

/**
 * Schema สำหรับ query parameters ในการดูรายการ
 */
export const listSeriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(), // หน้าที่ (ค่าเริ่มต้น: 1)
  limit: z.coerce.number().int().min(1).max(50).optional(), // จำนวนต่อหน้า (ค่าเริ่มต้น: 10)
  search: z.string().trim().min(1).optional(), // ค้นหาจาก title หรือ reviewDetail
  ratingCode: ratingEnum.optional(), // กรองตาม rating code
});

/**
 * DTO สำหรับ query parameters
 * ใช้ใน GET /series
 * มี Swagger examples เพื่อให้กรอกข้อมูลง่าย
 */
export class ListSeriesQueryDto extends createZodDto(listSeriesQuerySchema) {
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

  /**
   * คำค้นหา (ค้นจากชื่อหรือรายละเอียด)
   * @example "Breaking"
   */
  @ApiProperty({
    description: "คำค้นหา (ค้นจากชื่อหรือรายละเอียด)",
    example: "Breaking",
    required: false,
  })
  search?: string;

  /**
   * กรองตาม Rating code
   * @example "น18+"
   */
  @ApiProperty({
    description: "กรองตาม Rating code",
    example: "น18+",
    required: false,
    enum: ["ส", "ท", "น13+", "น15+", "น18+", "ฉ20+"],
  })
  ratingCode?: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+";
}

/**
 * Type สำหรับ TypeScript
 */
export type ListSeriesQuery = z.infer<typeof listSeriesQuerySchema>;
