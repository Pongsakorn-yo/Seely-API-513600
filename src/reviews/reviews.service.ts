/**
 * ============================================
 * Reviews Service
 * ============================================
 * Business logic สำหรับจัดการรีวิว
 * รวมถึงการสร้างรีวิวและคำนวณคะแนนเฉลี่ย
 */

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Review } from "./entities/review.entity";
import { Series } from "../series/entities/series.entity";
import { ListReviewsQuery } from "./dto";

/**
 * ReviewsService
 * จัดการการดูรายการรีวิวและสร้างรีวิวใหม่
 */
@Injectable()
export class ReviewsService {
  /**
   * Constructor
   * @param repo - Repository สำหรับจัดการ Review entity
   * @param seriesRepo - Repository สำหรับตรวจสอบว่า Series มีอยู่จริง
   */
  constructor(
    @InjectRepository(Review) private readonly repo: Repository<Review>,
    @InjectRepository(Series) private readonly seriesRepo: Repository<Series>,
  ) {}

  /**
   * ดูรายการรีวิวทั้งหมดของซีรีส์หนึ่ง
   * รองรับ pagination และเรียงตามวันที่ล่าสุดก่อน
   *
   * @param seriesId - ID ของซีรีส์
   * @param q - Query parameters (page, limit)
   * @returns Object ที่มี data และ meta (pagination info)
   *
   * @example
   * // GET /series/1/reviews?page=1&limit=10
   * {
   *   data: [{ id: 1, score: 4.5, comment: "ดีมาก" }],
   *   meta: { page: 1, limit: 10, itemCount: 5, pageCount: 1, hasNextPage: false }
   * }
   */
  async listBySeries(seriesId: number, q: ListReviewsQuery) {
    // คำนวณ page และ limit (ค่าเริ่มต้น: page=1, limit=10)
    const p = Math.max(1, Number(q.page) || 1);
    const l = Math.max(1, Number(q.limit) || 10);

    // ดึงข้อมูลพร้อมนับจำนวนทั้งหมด
    const [data, itemCount] = await this.repo.findAndCount({
      where: { seriesId }, // กรองเฉพาะซีรีส์นี้
      order: { createdAt: "DESC" }, // เรียงจากใหม่ไปเก่า
      skip: (p - 1) * l, // ข้ามหน้าที่ผ่านมา
      take: l, // จำนวนต่อหน้า
    });

    // สร้าง response พร้อม metadata
    return {
      data,
      meta: {
        page: p,
        limit: l,
        itemCount, // จำนวนรีวิวทั้งหมด
        pageCount: Math.ceil(itemCount / l), // จำนวนหน้าทั้งหมด
        hasNextPage: p * l < itemCount, // มีหน้าถัดไปหรือไม่
      },
    };
  }

  /**
   * สร้างรีวิวใหม่
   * ตรวจสอบว่าซีรีส์มีอยู่จริง และคำนวณคะแนนเฉลี่ยใหม่หลังเพิ่มรีวิว
   *
   * @param data - ข้อมูลรีวิว (seriesId, score, comment)
   * @param reviewerId - ID ของผู้รีวิว (จาก JWT token)
   * @returns Review ที่สร้างแล้ว พร้อมสถิติคะแนนเฉลี่ยและจำนวนรีวิว
   *
   * @throws NotFoundException - ถ้าไม่พบซีรีส์ที่ระบุ
   *
   * @example
   * // POST /reviews
   * // Body: { seriesId: 1, score: 4.5, comment: "ดีมาก" }
   * {
   *   id: 1,
   *   seriesId: 1,
   *   reviewerId: 2,
   *   score: 4.5,
   *   comment: "ดีมาก",
   *   stats: { averageScore: 4.25, reviewCount: 3 }
   * }
   */
  async create(data: Partial<Review>, reviewerId: number) {
    // ตรวจสอบว่าซีรีส์มีอยู่จริง
    const series = await this.seriesRepo.findOne({
      where: { id: data.seriesId },
    });
    if (!series) throw new NotFoundException("Series not found");

    // สร้างรีวิวใหม่
    const r = this.repo.create({
      ...data,
      reviewerId,
      seriesId: data.seriesId,
    });
    const saved = await this.repo.save(r);

    // คำนวณคะแนนเฉลี่ยและจำนวนรีวิวทั้งหมดของซีรีส์นี้
    const aggregate = await this.repo
      .createQueryBuilder("review")
      .select("AVG(review.score)", "avg") // คะแนนเฉลี่ย
      .addSelect("COUNT(review.id)", "cnt") // จำนวนรีวิว
      .where("review.seriesId = :seriesId", { seriesId: data.seriesId })
      .getRawOne<{ avg: string | null; cnt: string | null }>();

    // แปลงค่าเป็นตัวเลข
    const average = Number(aggregate?.avg ?? 0);

    // Return รีวิวพร้อมสถิติ
    return {
      ...saved,
      stats: {
        averageScore: Number(average.toFixed(2)), // ปัดเศษ 2 ตำแหน่ง
        reviewCount: Number(aggregate?.cnt ?? 0),
      },
    };
  }
}
