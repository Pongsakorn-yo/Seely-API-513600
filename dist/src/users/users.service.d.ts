import { Repository } from "typeorm";
import { Role, User } from "./entities/user.entity";
export declare class UsersService {
    private readonly repo;
    constructor(repo: Repository<User>);
    create(data: {
        username: string;
        password: string;
        role?: Role;
    }): Promise<User>;
    findById(id: number): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
}
