/**
 * ============================================
 * Reviews Service Unit Tests (BONUS FEATURE #1)
 * ============================================
 * ทดสอบการสร้างรีวิวและดูรายการรีวิว
 * 
 * 🎯 Bonus Feature: Unit Tests (6 test cases)
 * - Create: สร้างรีวิวพร้อมคำนวณ stats (avg, count)
 * - Create: NotFoundException เมื่อไม่พบ series
 * - List: แสดงรายการรีวิวของ series
 * - List: NotFoundException เมื่อไม่พบ series
 * - Pagination: คำนวณ totalPages ถูกต้อง
 */

import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { Review } from "./entities/review.entity";
import { Series } from "../series/entities/series.entity";

describe("ReviewsService", () => {
  let service: ReviewsService;
  let reviewRepository: Repository<Review>;
  let seriesRepository: Repository<Series>;

  const mockSeries = {
    id: 1,
    title: "Breaking Bad",
    year: 2008,
    reviewDetail: "Great series",
    recommenderScore: 5,
    ratingCode: "น18+",
    ownerId: 1,
  };

  const mockReview: Review = {
    id: 1,
    seriesId: 1,
    reviewerId: 1,
    score: 4.5,
    comment: "Great show!",
    createdAt: new Date(),
    series: mockSeries as Series,
    reviewer: { id: 1, username: "testuser", password: "", role: null } as any,
  };

  const mockReviewRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    })),
  };

  const mockSeriesRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
        {
          provide: getRepositoryToken(Series),
          useValue: mockSeriesRepository,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    reviewRepository = module.get<Repository<Review>>(
      getRepositoryToken(Review),
    );
    seriesRepository = module.get<Repository<Series>>(
      getRepositoryToken(Series),
    );

    jest.clearAllMocks();
  });

  describe("create", () => {
    it("✅ ควรสร้างรีวิวใหม่ได้สำเร็จ", async () => {
      const createDto = {
        seriesId: 1,
        score: 4.5,
        comment: "Great show!",
      };
      const reviewerId = 1;

      mockSeriesRepository.findOne.mockResolvedValue(mockSeries);
      mockReviewRepository.create.mockReturnValue(mockReview);
      mockReviewRepository.save.mockResolvedValue(mockReview);

      const qb = mockReviewRepository.createQueryBuilder();
      qb.getRawOne = jest.fn().mockResolvedValue({ avg: "4.5", cnt: "10" });

      const result = await service.create(createDto, reviewerId);

      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("stats");
      expect(result.stats).toHaveProperty("averageScore");
      expect(result.stats).toHaveProperty("reviewCount");
      expect(mockSeriesRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.seriesId },
      });
      expect(mockReviewRepository.save).toHaveBeenCalled();
    });

    it("❌ ควร throw NotFoundException ถ้าไม่พบ series", async () => {
      const createDto = {
        seriesId: 999,
        score: 4.5,
        comment: "Great show!",
      };

      mockSeriesRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("listBySeries", () => {
    it("✅ ควร list รีวิวของ series ได้", async () => {
      const seriesId = 1;
      const query = { page: 1, limit: 10 };
      const mockReviews = [mockReview];

      mockSeriesRepository.findOne.mockResolvedValue(mockSeries);

      const qb = mockReviewRepository.createQueryBuilder();
      qb.getManyAndCount = jest.fn().mockResolvedValue([mockReviews, 1]);

      const result = await service.listBySeries(seriesId, query);

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("meta");
      expect(result.data).toHaveLength(1);
      expect(result.meta).toHaveProperty("total", 1);
      expect(result.meta).toHaveProperty("page", 1);
      expect(mockSeriesRepository.findOne).toHaveBeenCalledWith({
        where: { id: seriesId },
      });
    });

    it("❌ ควร throw NotFoundException ถ้าไม่พบ series", async () => {
      const seriesId = 999;
      const query = { page: 1, limit: 10 };

      mockSeriesRepository.findOne.mockResolvedValue(null);

      await expect(service.listBySeries(seriesId, query)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("✅ ควรคำนวณ pagination ถูกต้อง", async () => {
      const seriesId = 1;
      const query = { page: 2, limit: 5 };
      const mockReviews = [mockReview];

      mockSeriesRepository.findOne.mockResolvedValue(mockSeries);

      const qb = mockReviewRepository.createQueryBuilder();
      qb.getManyAndCount = jest.fn().mockResolvedValue([mockReviews, 15]);

      const result = await service.listBySeries(seriesId, query);

      expect(result.meta).toEqual({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
      });
      expect(qb.skip).toHaveBeenCalledWith(5); // (page-1) * limit
      expect(qb.take).toHaveBeenCalledWith(5);
    });
  });
});
