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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListReviewsQueryDto = exports.listReviewsQuerySchema = exports.CreateReviewDto = exports.createReviewSchema = void 0;
const nestjs_zod_1 = require("nestjs-zod");
const zod_1 = require("zod");
const swagger_1 = require("@nestjs/swagger");
exports.createReviewSchema = zod_1.z.object({
    seriesId: zod_1.z.coerce.number().int().positive(),
    score: zod_1.z.coerce.number().min(1).max(5),
    comment: zod_1.z.string().optional(),
});
class CreateReviewDto extends (0, nestjs_zod_1.createZodDto)(exports.createReviewSchema) {
}
exports.CreateReviewDto = CreateReviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "ID ของซีรีส์ที่ต้องการรีวิว",
        example: 1,
        minimum: 1,
    }),
    __metadata("design:type", Number)
], CreateReviewDto.prototype, "seriesId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "คะแนนที่ให้ (1-5)",
        example: 4.5,
        minimum: 1,
        maximum: 5,
    }),
    __metadata("design:type", Number)
], CreateReviewDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "ความคิดเห็น/รีวิว (ไม่บังคับ)",
        example: "ซีรีส์ดีมาก! น่าติดตามมาก แนะนำเลยครับ",
        required: false,
    }),
    __metadata("design:type", String)
], CreateReviewDto.prototype, "comment", void 0);
exports.listReviewsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(50).optional(),
});
class ListReviewsQueryDto extends (0, nestjs_zod_1.createZodDto)(exports.listReviewsQuerySchema) {
}
exports.ListReviewsQueryDto = ListReviewsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "หน้าที่ต้องการดู (เริ่มจาก 1)",
        example: 1,
        required: false,
        minimum: 1,
    }),
    __metadata("design:type", Number)
], ListReviewsQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "จำนวนรายการต่อหน้า (สูงสุด 50)",
        example: 10,
        required: false,
        minimum: 1,
        maximum: 50,
    }),
    __metadata("design:type", Number)
], ListReviewsQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=dto.js.map