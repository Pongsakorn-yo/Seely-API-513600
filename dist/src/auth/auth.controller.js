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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const zod_1 = require("zod");
const nestjs_zod_1 = require("nestjs-zod");
const swagger_1 = require("@nestjs/swagger");
const RegisterSchema = zod_1.z.object({
    username: zod_1.z.string().min(3),
    password: zod_1.z.string().min(6),
});
class RegisterDto extends (0, nestjs_zod_1.createZodDto)(RegisterSchema) {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "ชื่อผู้ใช้ (อย่างน้อย 3 ตัวอักษร)",
        example: "john_doe",
        minLength: 3,
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)",
        example: "password123",
        minLength: 6,
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
const LoginSchema = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string(),
});
class LoginDto extends (0, nestjs_zod_1.createZodDto)(LoginSchema) {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "ชื่อผู้ใช้",
        example: "john_doe",
    }),
    __metadata("design:type", String)
], LoginDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "รหัสผ่าน",
        example: "password123",
    }),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
const RefreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(10),
});
class RefreshDto extends (0, nestjs_zod_1.createZodDto)(RefreshSchema) {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Refresh token ที่ได้จากการ login",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiam9obl9kb2UiLCJpYXQiOjE2OTQ3MDAwMDAsImV4cCI6MTY5NTMwNDgwMH0.xyz123",
        minLength: 10,
    }),
    __metadata("design:type", String)
], RefreshDto.prototype, "refreshToken", void 0);
let AuthController = class AuthController {
    constructor(auth) {
        this.auth = auth;
    }
    register(dto) {
        return this.auth.register(dto.username, dto.password);
    }
    login(dto) {
        return this.auth.login(dto.username, dto.password);
    }
    refresh(dto) {
        return this.auth.refresh(dto.refreshToken);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("register"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)("login"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)("refresh"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RefreshDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refresh", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)("auth"),
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map