/**
 * ============================================
 * Ownership Guard
 * ============================================
 * Guard สำหรับตรวจสอบว่าผู้ใช้เป็นเจ้าของ resource หรือไม่
 * ใช้กับ API endpoints ที่ต้องการป้องกันการแก้ไขข้อมูลของคนอื่น
 * เช่น PATCH /series/:id, DELETE /series/:id
 */

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { SeriesService } from "../../series/series.service";

/**
 * OwnershipGuard
 * ตรวจสอบว่าผู้ใช้ที่ login อยู่เป็นเจ้าของ series หรือไม่
 *
 * วิธีการทำงาน:
 * 1. ดึง user ID จาก JWT token (req.user.sub)
 * 2. ดึง series ID จาก URL parameter
 * 3. เช็คว่า series นั้นมี owner ID ตรงกับ user ID หรือไม่
 * 4. ถ้าไม่ตรง throw ForbiddenException
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  /**
   * Constructor
   * @param seriesService - SeriesService สำหรับดึงข้อมูล owner ID
   */
  constructor(private readonly seriesService: SeriesService) {}

  /**
   * ฟังก์ชันหลักที่ NestJS เรียกใช้เพื่อตรวจสอบสิทธิ์
   *
   * @param ctx - ExecutionContext จาก NestJS
   * @returns Promise<boolean> - true ถ้าผ่านการตรวจสอบ, throw exception ถ้าไม่ผ่าน
   * @throws ForbiddenException - ถ้าผู้ใช้ไม่ใช่เจ้าของหรือไม่พบ series
   *
   * @example
   * // ใช้ใน controller:
   * @UseGuards(AuthGuard('jwt'), OwnershipGuard)
   * @Patch(':id')
   * update(@Param('id') id: string, @Body() dto: UpdateSeriesDto) {
   *   // จะเข้ามาถึงตรงนี้ได้ก็ต่อเมื่อผู้ใช้เป็นเจ้าของ series นี้
   * }
   */
  async canActivate(ctx: ExecutionContext) {
    // ดึง HTTP request object
    const req = ctx.switchToHttp().getRequest();

    // ดึง user ID จาก JWT payload (รองรับทั้ง FlexibleAuthGuard และ JwtAuthGuard)
    // FlexibleAuthGuard ใช้ req.user.id, JwtStrategy ใช้ req.user.sub
    const userId = req.user?.id || req.user?.sub;

    // ดึง series ID จาก URL parameter (:id)
    const seriesId = +req.params.id;

    // ค้นหาว่า series นี้เป็นของใคร
    const ownerId = await this.seriesService.findOwnerId(seriesId);

    // ตรวจสอบ: ถ้าไม่พบ series หรือ owner ไม่ตรงกับผู้ใช้ปัจจุบัน
    if (!ownerId || ownerId !== userId) {
      throw new ForbiddenException("Not owner");
    }

    // ผ่านการตรวจสอบ - อนุญาตให้เข้าถึง endpoint
    return true;
  }
}
