import { AuthService } from "./auth.service";
import { z } from "zod";
declare const RegisterDto_base: import("nestjs-zod").ZodDto<{
    username: string;
    password: string;
}, z.ZodObjectDef<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny>, {
    username: string;
    password: string;
}>;
declare class RegisterDto extends RegisterDto_base {
    username: string;
    password: string;
}
declare const LoginDto_base: import("nestjs-zod").ZodDto<{
    username: string;
    password: string;
}, z.ZodObjectDef<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny>, {
    username: string;
    password: string;
}>;
declare class LoginDto extends LoginDto_base {
    username: string;
    password: string;
}
declare const RefreshDto_base: import("nestjs-zod").ZodDto<{
    refreshToken: string;
}, z.ZodObjectDef<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny>, {
    refreshToken: string;
}>;
declare class RefreshDto extends RefreshDto_base {
    refreshToken: string;
}
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): Promise<any>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
    }>;
    refresh(dto: RefreshDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
export {};
