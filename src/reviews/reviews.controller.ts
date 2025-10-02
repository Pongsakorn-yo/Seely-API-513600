/**
 * ============================================
 * Reviews Controller
 * ============================================
 * HTTP endpoints สำหรับจัดการรีวิว
 */

import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto, ListReviewsQueryDto } from "./dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";

/**
 * Reviews Controller
 * จัดการ API endpoints สำหรับรีวิว
 */
@ApiTags("reviews") // จัดกลุ่มใน Swagger UI
@Controller()
export class ReviewsController {
  /**
   * Constructor
   * @param service - ReviewsService สำหรับ business logic
   */
  constructor(private readonly service: ReviewsService) {}

  /**
   * GET /series/:id/reviews
   * ดูรายการรีวิวทั้งหมดของซีรีส์หนึ่ง
   * ไม่ต้อง login ก็ดูได้ (public endpoint)
   *
   * @param id - ID ของซีรีส์
   * @param query - Query parameters (page, limit)
   * @returns รายการรีวิวพร้อม pagination
   *
   * @example
   * GET /series/1/reviews?page=1&limit=10
   */
  @Get("series/:id/reviews")
  listBySeries(@Param("id") id: string, @Query() query: ListReviewsQueryDto) {
    return this.service.listBySeries(+id, query);
  }

  /**
   * POST /reviews
   * สร้างรีวิวใหม่
   * ต้อง login ด้วย JWT token (protected endpoint)
   *
   * @param dto - ข้อมูลรีวิว (seriesId, score, comment)
   * @param req - Request object ที่มี user data จาก JWT
   * @returns รีวิวที่สร้างแล้ว พร้อมสถิติคะแนนเฉลี่ย
   *
   * @example
   * POST /reviews
   * Headers: { Authorization: "Bearer <token>" }
   * Body: { seriesId: 1, score: 4.5, comment: "ดีมาก" }
   */
  @ApiBearerAuth() // ต้องใส่ token ใน Swagger UI
  @UseGuards(AuthGuard("jwt")) // ป้องกันด้วย JWT
  @Post("reviews")
  create(@Body() dto: CreateReviewDto, @Req() req: any) {
    // ดึง user ID จาก JWT token (req.user.sub)
    return this.service.create(dto, req.user.sub);
  }
}
