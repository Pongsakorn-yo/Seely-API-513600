/**
 * ============================================
 * Series Service Unit Tests
 * ============================================
 * ทดสอบ CRUD operations และ pagination
 */

import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { SeriesService } from "./series.service";
import { Series } from "./entities/series.entity";
import { User } from "../users/entities/user.entity";
import { Role } from "../users/entities/user.entity";

describe("SeriesService", () => {
  let service: SeriesService;
  let seriesRepository: Repository<Series>;

  const mockUser = {
    id: 1,
    username: "testuser",
    role: Role.USER,
  };

  const mockSeries: Series = {
    id: 1,
    title: "Breaking Bad",
    year: 2008,
    reviewDetail: "Great series about chemistry teacher",
    recommenderScore: 5,
    ratingCode: "น18+",
    ownerId: 1,
    owner: mockUser as User,
  };

  const mockSeriesRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeriesService,
        {
          provide: getRepositoryToken(Series),
          useValue: mockSeriesRepository,
        },
      ],
    }).compile();

    service = module.get<SeriesService>(SeriesService);
    seriesRepository = module.get<Repository<Series>>(
      getRepositoryToken(Series),
    );

    jest.clearAllMocks();
  });

  describe("create", () => {
    it("✅ ควรสร้าง series ใหม่ได้สำเร็จ", async () => {
      const createDto = {
        title: "Breaking Bad",
        year: 2008,
        reviewDetail: "Great series",
        recommenderScore: 5,
        ratingCode: "น18+" as any,
      };
      const userId = 1;

      mockSeriesRepository.create.mockReturnValue({
        ...mockSeries,
        ...createDto,
      });
      mockSeriesRepository.save.mockResolvedValue({
        id: 1,
        ...createDto,
        ownerId: userId,
      });

      const result = await service.create(createDto, userId);

      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("title", createDto.title);
      expect(mockSeriesRepository.create).toHaveBeenCalledWith({
        ...createDto,
        ownerId: userId,
      });
      expect(mockSeriesRepository.save).toHaveBeenCalled();
    });
  });

  describe("list", () => {
    it("✅ ควร list series พร้อม pagination ได้", async () => {
      const query = { page: 1, limit: 10 };
      const mockData = [mockSeries];
      const mockStats = [{ seriesId: 1, avg: "4.5", cnt: "10" }];

      const qb = mockSeriesRepository.createQueryBuilder();
      qb.getManyAndCount = jest.fn().mockResolvedValue([mockData, 1]);

      const statsQb = mockSeriesRepository.createQueryBuilder();
      statsQb.getRawMany = jest.fn().mockResolvedValue(mockStats);

      const result = await service.list(query);

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("meta");
      expect(result.meta).toHaveProperty("total", 1);
      expect(result.meta).toHaveProperty("page", 1);
    });

    it("✅ ควร filter ตาม search query ได้", async () => {
      const query = { page: 1, limit: 10, search: "Breaking" };
      const qb = mockSeriesRepository.createQueryBuilder();

      qb.getManyAndCount = jest.fn().mockResolvedValue([[mockSeries], 1]);

      const statsQb = mockSeriesRepository.createQueryBuilder();
      statsQb.getRawMany = jest.fn().mockResolvedValue([]);

      const result = await service.list(query);

      expect(qb.andWhere).toHaveBeenCalled();
      expect(result.data).toBeDefined();
    });
  });

  describe("findOne", () => {
    it("✅ ควรหา series ด้วย ID ได้", async () => {
      mockSeriesRepository.findOne.mockResolvedValue(mockSeries);

      const result = await service.findOne(1);

      expect(result).toEqual(mockSeries);
      expect(mockSeriesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["owner"],
      });
    });

    it("❌ ควร throw NotFoundException ถ้าไม่พบ series", async () => {
      mockSeriesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("✅ ควร update series ได้สำเร็จ", async () => {
      const updateDto = { title: "Breaking Bad - Updated" };
      const updatedSeries = { ...mockSeries, ...updateDto };

      mockSeriesRepository.findOne.mockResolvedValue(mockSeries);
      mockSeriesRepository.save.mockResolvedValue(updatedSeries);

      const result = await service.update(1, updateDto);

      expect(result).toHaveProperty("title", updateDto.title);
      expect(mockSeriesRepository.save).toHaveBeenCalled();
    });

    it("❌ ควร throw NotFoundException ถ้าไม่พบ series", async () => {
      mockSeriesRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { title: "Test" })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("✅ ควรลบ series ได้สำเร็จ", async () => {
      mockSeriesRepository.findOne.mockResolvedValue(mockSeries);
      mockSeriesRepository.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove(1);

      expect(result).toEqual({ message: "Series deleted successfully" });
      expect(mockSeriesRepository.delete).toHaveBeenCalledWith(1);
    });

    it("❌ ควร throw NotFoundException ถ้าไม่พบ series", async () => {
      mockSeriesRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
