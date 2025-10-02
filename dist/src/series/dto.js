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
exports.ListSeriesQueryDto = exports.listSeriesQuerySchema = exports.UpdateSeriesDto = exports.updateSeriesSchema = exports.CreateSeriesDto = exports.createSeriesSchema = exports.ratingEnum = void 0;
const nestjs_zod_1 = require("nestjs-zod");
const zod_1 = require("zod");
const swagger_1 = require("@nestjs/swagger");
exports.ratingEnum = zod_1.z.enum(["ส", "ท", "น13+", "น15+", "น18+", "ฉ20+"]);
exports.createSeriesSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    year: zod_1.z.coerce
        .number()
        .int()
        .min(1900)
        .max(new Date().getFullYear() + 1),
    reviewDetail: zod_1.z.string().min(1),
    recommenderScore: zod_1.z.coerce.number().min(0).max(5),
    ratingCode: exports.ratingEnum,
});
class CreateSeriesDto extends (0, nestjs_zod_1.createZodDto)(exports.createSeriesSchema) {
}
exports.CreateSeriesDto = CreateSeriesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "ชื่อซีรีส์",
        example: "Breaking Bad",
        minLength: 1,
    }),
    __metadata("design:type", String)
], CreateSeriesDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "ปีที่ออกอากาศ",
        example: 2008,
        minimum: 1900,
        maximum: new Date().getFullYear() + 1,
    }),
    __metadata("design:type", Number)
], CreateSeriesDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "รายละเอียด/รีวิวของซีรีส์",
        example: "เรื่องราวของครูเคมีที่กลายเป็นเจ้าพ่อยาเสพติด ซีรีส์ที่ได้รับคำชมมากที่สุดเรื่องหนึ่ง",
        minLength: 1,
    }),
    __metadata("design:type", String)
], CreateSeriesDto.prototype, "reviewDetail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "คะแนนแนะนำจากผู้รีวิว (0-5)",
        example: 5,
        minimum: 0,
        maximum: 5,
    }),
    __metadata("design:type", Number)
], CreateSeriesDto.prototype, "recommenderScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Rating code (ส=ทุกคน, ท=ทั่วไป, น13+=13ปีขึ้นไป, น15+=15ปีขึ้นไป, น18+=18ปีขึ้นไป, ฉ20+=20ปีขึ้นไป)",
        example: "น18+",
        enum: ["ส", "ท", "น13+", "น15+", "น18+", "ฉ20+"],
    }),
    __metadata("design:type", String)
], CreateSeriesDto.prototype, "ratingCode", void 0);
exports.updateSeriesSchema = exports.createSeriesSchema.partial();
class UpdateSeriesDto extends (0, nestjs_zod_1.createZodDto)(exports.updateSeriesSchema) {
}
exports.UpdateSeriesDto = UpdateSeriesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "ชื่อซีรีส์",
        example: "Breaking Bad: The Complete Series",
        required: false,
        minLength: 1,
    }),
    __metadata("design:type", String)
], UpdateSeriesDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "ปีที่ออกอากาศ",
        example: 2008,
        required: false,
        minimum: 1900,
        maximum: new Date().getFullYear() + 1,
    }),
    __metadata("design:type", Number)
], UpdateSeriesDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "รายละเอียด/รีวิวของซีรีส์",
        example: "ซีรีส์คลาสสิกที่ทุกคนต้องดู! อัปเดตรีวิวใหม่",
        required: false,
        minLength: 1,
    }),
    __metadata("design:type", String)
], UpdateSeriesDto.prototype, "reviewDetail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "คะแนนแนะนำจากผู้รีวิว (0-5)",
        example: 4.8,
        required: false,
        minimum: 0,
        maximum: 5,
    }),
    __metadata("design:type", Number)
], UpdateSeriesDto.prototype, "recommenderScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Rating code (ส=ทุกคน, ท=ทั่วไป, น13+=13ปีขึ้นไป, น15+=15ปีขึ้นไป, น18+=18ปีขึ้นไป, ฉ20+=20ปีขึ้นไป)",
        example: "น18+",
        required: false,
        enum: ["ส", "ท", "น13+", "น15+", "น18+", "ฉ20+"],
    }),
    __metadata("design:type", String)
], UpdateSeriesDto.prototype, "ratingCode", void 0);
exports.listSeriesQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(50).optional(),
    search: zod_1.z.string().trim().min(1).optional(),
    ratingCode: exports.ratingEnum.optional(),
});
class ListSeriesQueryDto extends (0, nestjs_zod_1.createZodDto)(exports.listSeriesQuerySchema) {
}
exports.ListSeriesQueryDto = ListSeriesQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "หน้าที่ต้องการดู (เริ่มจาก 1)",
        example: 1,
        required: false,
        minimum: 1,
    }),
    __metadata("design:type", Number)
], ListSeriesQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "จำนวนรายการต่อหน้า (สูงสุด 50)",
        example: 10,
        required: false,
        minimum: 1,
        maximum: 50,
    }),
    __metadata("design:type", Number)
], ListSeriesQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "คำค้นหา (ค้นจากชื่อหรือรายละเอียด)",
        example: "Breaking",
        required: false,
    }),
    __metadata("design:type", String)
], ListSeriesQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "กรองตาม Rating code",
        example: "น18+",
        required: false,
        enum: ["ส", "ท", "น13+", "น15+", "น18+", "ฉ20+"],
    }),
    __metadata("design:type", String)
], ListSeriesQueryDto.prototype, "ratingCode", void 0);
//# sourceMappingURL=dto.js.map