import { UsersService } from "./users.service";
import { z } from "zod";
import { Role } from "./entities/user.entity";
declare const CreateUserDto_base: import("nestjs-zod").ZodDto<{
    username: string;
    password: string;
    role?: "USER" | "ADMIN" | undefined;
}, z.ZodObjectDef<{
    username: z.ZodString;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["USER", "ADMIN"]>>;
}, "strip", z.ZodTypeAny>, {
    username: string;
    password: string;
    role?: "USER" | "ADMIN" | undefined;
}>;
declare class CreateUserDto extends CreateUserDto_base {
    username: string;
    password: string;
    role?: "USER" | "ADMIN";
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createUser(dto: CreateUserDto, req: any): Promise<{
        id: number;
        username: string;
        role: Role;
    }>;
    getMe(req: any): Promise<{
        id: number;
        username: string;
        role: Role;
    }>;
}
export {};
