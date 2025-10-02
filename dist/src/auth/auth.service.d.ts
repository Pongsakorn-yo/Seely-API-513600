import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
export declare class AuthService {
    private readonly users;
    private readonly jwt;
    private readonly config;
    constructor(users: UsersService, jwt: JwtService, config: ConfigService);
    register(username: string, password: string): Promise<any>;
    validateUser(username: string, password: string): Promise<import("../users/entities/user.entity").User | null>;
    login(username: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
