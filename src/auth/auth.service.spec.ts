/**
 * ============================================
 * Auth Service Unit Tests
 * ============================================
 * ทดสอบ business logic ของ AuthService
 */

import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { Role } from "../users/entities/user.entity";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

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
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

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
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(true as never));
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
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(false as never));

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
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(true as never));

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
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(false as never));

      const result = await service.validateUser(username, password);

      expect(result).toBeNull();
    });
  });

  describe("refresh", () => {
    it("✅ ควรสร้าง access token ใหม่จาก refresh token ได้", async () => {
      const userId = "1";

      mockUsersService.findById.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValueOnce("new-access-token");

      const result = await service.refresh(userId);

      expect(result).toHaveProperty("accessToken", "new-access-token");
      expect(mockUsersService.findById).toHaveBeenCalledWith(Number(userId));
    });

    it("❌ ควร throw UnauthorizedException ถ้าไม่พบ user", async () => {
      const userId = "999";

      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.refresh(userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
