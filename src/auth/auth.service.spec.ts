/**
 * ============================================
 * Auth Service Unit Tests (BONUS FEATURE #1)
 * ============================================
 * ทดสอบ business logic ของ AuthService
 *
 * 🎯 Bonus Feature: Unit Tests (8 test cases)
 * - Register: สำเร็จ, ซ้ำ (ConflictException)
 * - Login: สำเร็จ, ผิด (UnauthorizedException)
 * - ValidateUser: ถูกต้อง, ผิด
 * - Refresh Token: สำเร็จ, ผิด (UnauthorizedException)
 */

import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { Role } from "../users/entities/user.entity";

// Mock bcrypt module ทั้งหมด
jest.mock("bcrypt");

describe("AuthService", () => {
  let service: AuthService;

  const mockUser = {
    id: 1,
    username: "testuser",
    password: "$2b$10$hashedpassword", // hashed password
    role: Role.USER,
  };

  const mockUsersService = {
    findByUsername: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: "test-secret",
        REFRESH_JWT_SECRET: "test-refresh-secret",
        JWT_EXPIRES_IN: "15m",
        REFRESH_JWT_EXPIRES_IN: "7d",
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("✅ ควรสร้าง user ใหม่ได้สำเร็จ", async () => {
      const username = "newuser";
      const password = "password123";

      mockUsersService.findByUsername.mockResolvedValue(null); // username ยังไม่มี
      mockUsersService.create.mockResolvedValue({
        id: 2,
        username,
        role: Role.USER,
      });

      const result = await service.register(username, password);

      expect(result).toEqual({
        id: 2,
        username,
        role: Role.USER,
      });
      expect(mockUsersService.findByUsername).toHaveBeenCalledWith(username);
      expect(mockUsersService.create).toHaveBeenCalled();
    });

    it("❌ ควร throw ConflictException ถ้า username ซ้ำ", async () => {
      const username = "testuser";
      const password = "password123";

      mockUsersService.findByUsername.mockResolvedValue(mockUser); // username มีแล้ว

      await expect(service.register(username, password)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsersService.findByUsername).toHaveBeenCalledWith(username);
    });
  });

  describe("login", () => {
    it("✅ ควร login สำเร็จและ return tokens", async () => {
      const username = "testuser";
      const password = "password123";

      mockUsersService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValueOnce("access-token");
      mockJwtService.signAsync.mockResolvedValueOnce("refresh-token");

      const result = await service.login(username, password);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(mockUsersService.findByUsername).toHaveBeenCalledWith(username);
    });

    it("❌ ควร throw UnauthorizedException ถ้า username ไม่มี", async () => {
      const username = "wronguser";
      const password = "password123";

      mockUsersService.findByUsername.mockResolvedValue(null);

      await expect(service.login(username, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("❌ ควร throw UnauthorizedException ถ้า password ผิด", async () => {
      const username = "testuser";
      const password = "wrongpassword";

      mockUsersService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(username, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("validateUser", () => {
    it("✅ ควร return user ถ้า username และ password ถูกต้อง", async () => {
      const username = "testuser";
      const password = "password123";

      mockUsersService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(username, password);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findByUsername).toHaveBeenCalledWith(username);
    });

    it("❌ ควร return null ถ้าไม่พบ user", async () => {
      const username = "wronguser";
      const password = "password123";

      mockUsersService.findByUsername.mockResolvedValue(null);

      const result = await service.validateUser(username, password);

      expect(result).toBeNull();
    });

    it("❌ ควร return null ถ้า password ผิด", async () => {
      const username = "testuser";
      const password = "wrongpassword";

      mockUsersService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(username, password);

      expect(result).toBeNull();
    });
  });

  describe("refresh", () => {
    it("✅ ควรสร้าง access token ใหม่จาก refresh token ได้", async () => {
      const refreshToken = "valid-refresh-token";
      const decodedPayload = {
        sub: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      };

      mockJwtService.verifyAsync = jest.fn().mockResolvedValue(decodedPayload);
      mockJwtService.signAsync
        .mockResolvedValueOnce("new-access-token")
        .mockResolvedValueOnce("new-refresh-token");

      const result = await service.refresh(refreshToken);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.accessToken).toBe("new-access-token");
      expect(result.refreshToken).toBe("new-refresh-token");
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        refreshToken,
        expect.any(Object),
      );
    });

    it("❌ ควร throw UnauthorizedException ถ้า refresh token ไม่ถูกต้อง", async () => {
      const invalidToken = "invalid-token";

      mockJwtService.verifyAsync = jest
        .fn()
        .mockRejectedValue(new Error("Invalid token"));

      await expect(service.refresh(invalidToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
