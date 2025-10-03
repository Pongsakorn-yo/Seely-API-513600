/**
 * ============================================
 * Series Controller - API Endpoints สำหรับซีรีส์
 * ============================================
 * จัดการ HTTP requests สำหรับซีรีส์
 * - GET /series - ดูรายการซีรีส์ (ทุกคนเข้าถึงได้)
 * - GET /series/:id - ดูรายละเอียดซีรีส์
 * - POST /series - เพิ่มซีรีส์ใหม่ (ต้อง login)
 * - PATCH /series/:id - แก้ไขซีรีส์ (เจ้าของเท่านั้น)
 * - DELETE /series/:id - ลบซีรีส์ (เจ้าของเท่านั้น)
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { SeriesService } from "./series.service";
import { CreateSeriesDto, ListSeriesQueryDto, UpdateSeriesDto } from "./dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { OwnershipGuard } from "../common/guards/ownership.guard";
import { FlexibleAuthGuard } from "../common/guards/flexible-auth.guard";

/**
 * Controller สำหรับจัดการ Series
 */
@ApiTags("series") // จัดกลุ่มใน Swagger UI
@Controller("series")
export class SeriesController {
  constructor(private readonly service: SeriesService) {}

  /**
   * GET /series
   * ดูรายการซีรีส์ทั้งหมด พร้อม pagination และ filter
   * ไม่ต้อง login (ทุกคนเข้าถึงได้)
   */
  @Get()
  list(@Query() query: ListSeriesQueryDto) {
    return this.service.list(query);
  }

  /**
   * GET /series/:id
   * ดูรายละเอียดซีรีส์ พร้อมข้อมูลเจ้าของและ stats
   * ไม่ต้อง login
   */
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(+id);
  }

  /**
   * POST /series
   * เพิ่มซีรีส์ใหม่
   * ต้อง login (รองรับทั้ง JWT และ Keycloak token)
   */
  @ApiBearerAuth() // ต้องใส่ Bearer token ใน Swagger
  @UseGuards(FlexibleAuthGuard) // รองรับทั้ง JWT และ Keycloak
  @Post()
  create(@Body() dto: CreateSeriesDto, @Req() req: any) {
    // ดึง user ID จาก req.user (รองรับทั้ง JWT และ Keycloak)
    const userId = req.user.id || req.user.sub;
    return this.service.create(dto, userId);
  }

  /**
   * PATCH /series/:id
   * แก้ไขซีรีส์
   * ต้องเป็นเจ้าของซีรีส์เท่านั้น (รองรับทั้ง JWT และ Keycloak)
   */
  @ApiBearerAuth()
  @UseGuards(FlexibleAuthGuard, OwnershipGuard) // รองรับทั้ง JWT และ Keycloak
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateSeriesDto) {
    return this.service.update(+id, dto);
  }

  /**
   * DELETE /series/:id
   * ลบซีรีส์
   * ต้องเป็นเจ้าของซีรีส์เท่านั้น (รองรับทั้ง JWT และ Keycloak)
   */
  @ApiBearerAuth()
  @UseGuards(FlexibleAuthGuard, OwnershipGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(+id);
  }
}
