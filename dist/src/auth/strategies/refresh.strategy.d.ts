import { Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
declare const RefreshJwtStrategy_base: new (...args: any[]) => Strategy;
export declare class RefreshJwtStrategy extends RefreshJwtStrategy_base {
    constructor(config: ConfigService);
    validate(payload: any): Promise<{
        sub: any;
        username: any;
        role: any;
    }>;
}
export {};
