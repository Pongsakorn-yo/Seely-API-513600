"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("./entities/review.entity");
const series_entity_1 = require("../series/entities/series.entity");
let ReviewsService = class ReviewsService {
    constructor(repo, seriesRepo) {
        this.repo = repo;
        this.seriesRepo = seriesRepo;
    }
    async listBySeries(seriesId, q) {
        const p = Math.max(1, Number(q.page) || 1);
        const l = Math.max(1, Number(q.limit) || 10);
        const [data, itemCount] = await this.repo.findAndCount({
            where: { seriesId },
            order: { createdAt: "DESC" },
            skip: (p - 1) * l,
            take: l,
        });
        return {
            data,
            meta: {
                page: p,
                limit: l,
                itemCount,
                pageCount: Math.ceil(itemCount / l),
                hasNextPage: p * l < itemCount,
            },
        };
    }
    async create(data, reviewerId) {
        var _a, _b;
        const series = await this.seriesRepo.findOne({
            where: { id: data.seriesId },
        });
        if (!series)
            throw new common_1.NotFoundException("Series not found");
        const r = this.repo.create({
            ...data,
            reviewerId,
            seriesId: data.seriesId,
        });
        const saved = await this.repo.save(r);
        const aggregate = await this.repo
            .createQueryBuilder("review")
            .select("AVG(review.score)", "avg")
            .addSelect("COUNT(review.id)", "cnt")
            .where("review.seriesId = :seriesId", { seriesId: data.seriesId })
            .getRawOne();
        const average = Number((_a = aggregate === null || aggregate === void 0 ? void 0 : aggregate.avg) !== null && _a !== void 0 ? _a : 0);
        return {
            ...saved,
            stats: {
                averageScore: Number(average.toFixed(2)),
                reviewCount: Number((_b = aggregate === null || aggregate === void 0 ? void 0 : aggregate.cnt) !== null && _b !== void 0 ? _b : 0),
            },
        };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(1, (0, typeorm_1.InjectRepository)(series_entity_1.Series)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map