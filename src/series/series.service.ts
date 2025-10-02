/**
 * ============================================
 * Series Service - Service จัดการข้อมูลซีรีส์
 * ============================================
 * จัดการ CRUD operations สำหรับซีรีส์
 * - รายการซีรีส์ พร้อม pagination, search, filter
 * - คำนวณคะแนนเฉลี่ยและจำนวนรีวิว
 * - เพิ่ม/แก้ไข/ลบซีรีส์
 */

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Series } from "./entities/series.entity";
import { ListSeriesQuery } from "./dto";
import { Review } from "../reviews/entities/review.entity";

@Injectable()
export class SeriesService {
  constructor(
    // Inject Series Repository
    @InjectRepository(Series) private readonly repo: Repository<Series>,
  ) {}

  /**
   * หา owner ID ของซีรีส์ (ใช้สำหรับตรวจสอบเจ้าของ)
   * @param seriesId - ID ของซีรีส์
   * @returns Owner ID หรือ undefined ถ้าไม่พบ
   */
  async findOwnerId(seriesId: number) {
    const row = await this.repo.findOne({
      where: { id: seriesId },
      select: { ownerId: true, id: true } as any,
    });
    return row?.ownerId;
  }

  /**
   * ดูรายการซีรีส์ทั้งหมด พร้อม pagination และ filtering
   * @param q - Query parameters { page?, limit?, search?, ratingCode? }
   * @returns { data: series[], meta: pagination info }
   */
  async list(q: ListSeriesQuery) {
    // Pagination setup
    const page = Math.max(1, Number(q.page) || 1);
    const limit = Math.max(1, Number(q.limit) || 10);

    // สร้าง query builder
    const qb = this.repo
      .createQueryBuilder("s")
      .leftJoin("s.owner", "o") // Join กับ owner เพื่อดึง username
      .addSelect(["o.id", "o.username"]);

    // ค้นหาจาก title หรือ reviewDetail (case-insensitive)
    if (q.search) {
      const likeSearch = `%${q.search}%`;
      qb.andWhere("(s.title ILIKE :search OR s.reviewDetail ILIKE :search)", {
        search: likeSearch,
      });
    }

    // กรองตาม rating code
    if (q.ratingCode) {
      qb.andWhere("s.ratingCode = :rc", { rc: q.ratingCode });
    }

    // ดึงข้อมูลพร้อม pagination
    const [data, itemCount] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // ====================================
    // คำนวณคะแนนเฉลี่ยและจำนวนรีวิว
    // ====================================
    const ids = data.map((d) => d.id);
    const stats: Record<number, { averageScore: number; reviewCount: number }> =
      {};

    if (ids.length) {
      // Query คะแนนเฉลี่ยและจำนวนรีวิวสำหรับแต่ละซีรีส์
      const rows = await this.repo.manager
        .createQueryBuilder(Review, "review")
        .select("review.seriesId", "seriesId")
        .addSelect("AVG(review.score)", "avg")
        .addSelect("COUNT(review.id)", "cnt")
        .where("review.seriesId IN (:...ids)", { ids })
        .groupBy("review.seriesId")
        .getRawMany<{
          seriesId: number;
          avg: string | null;
          cnt: string | null;
        }>();

      // สร้าง object สำหรับเก็บ stats แต่ละซีรีส์
      for (const row of rows) {
        const seriesId = Number(row.seriesId);
        if (!Number.isFinite(seriesId)) continue;

        const average = Number(row.avg ?? 0);
        stats[seriesId] = {
          averageScore: Number(average.toFixed(2)), // ปัดเป็น 2 ทศนิยม
          reviewCount: Number(row.cnt ?? 0),
        };
      }
    }

    // เพิ่ม stats เข้าไปในแต่ละซีรีส์
    const withStats = data.map((d) => ({
      ...d,
      stats: stats[d.id] || { averageScore: 0, reviewCount: 0 },
    }));

    // Return พร้อม pagination metadata
    return {
      data: withStats,
      meta: {
        page,
        limit,
        itemCount,
        pageCount: Math.ceil(itemCount / limit),
        hasNextPage: page * limit < itemCount,
      },
    };
  }

  /**
   * ดูรายละเอียดซีรีส์ทีละตัว พร้อมข้อมูลเจ้าของและ stats
   * @param id - Series ID
   * @returns Series object with owner and stats
   * @throws NotFoundException ถ้าไม่พบซีรีส์
   */
  async findOne(id: number) {
    // ดึงข้อมูลซีรีส์ พร้อม owner
    const s = await this.repo.findOne({
      where: { id },
      relations: ["owner"],
    });

    if (!s) {
      throw new NotFoundException("Series not found");
    }

    // ลบ password ออกจาก owner object
    if (s.owner) {
      const owner = { ...(s.owner as any) };
      delete owner.password;
      (s as any).owner = owner;
    }

    // คำนวณ stats (คะแนนเฉลี่ยและจำนวนรีวิว)
    const statsRow = await this.repo.manager
      .createQueryBuilder(Review, "review")
      .select("AVG(review.score)", "avg")
      .addSelect("COUNT(review.id)", "cnt")
      .where("review.seriesId = :seriesId", { seriesId: id })
      .getRawOne<{ avg: string | null; cnt: string | null }>();

    const average = Number(statsRow?.avg ?? 0);

    return {
      ...s,
      stats: {
        averageScore: Number(average.toFixed(2)),
        reviewCount: Number(statsRow?.cnt ?? 0),
      },
    };
  }

  /**
   * สร้างซีรีส์ใหม่
   * @param data - ข้อมูลซีรีส์
   * @param ownerId - ID ของผู้สร้าง
   * @returns Series object ที่สร้างเสร็จแล้ว
   */
  async create(data: Partial<Series>, ownerId: number) {
    const s = this.repo.create({ ...data, ownerId });
    return this.repo.save(s);
  }

  /**
   * อัปเดตข้อมูลซีรีส์
   * @param id - Series ID
   * @param data - ข้อมูลที่ต้องการอัปเดต
   * @returns Series object ที่อัปเดตแล้ว
   * @throws NotFoundException ถ้าไม่พบซีรีส์
   */
  async update(id: number, data: Partial<Series>) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException();

    Object.assign(s, data);
    return this.repo.save(s);
  }

  /**
   * ลบซีรีส์
   * @param id - Series ID
   * @throws NotFoundException ถ้าไม่พบซีรีส์
   */
  async remove(id: number) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException();

    await this.repo.remove(s);
    return;
  }
}
