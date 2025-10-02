export declare enum Role {
    USER = "USER",
    ADMIN = "ADMIN"
}
export declare class User {
    id: number;
    username: string;
    password: string;
    role: Role;
}
