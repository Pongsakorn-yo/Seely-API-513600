/**
 * ============================================
 * Keycloak Guard - Guard สำหรับตรวจสอบ Keycloak token
 * ============================================
 * Guard นี้ใช้สำหรับป้องกัน endpoints ด้วย Keycloak authentication
 * ตรวจสอบ Bearer token จาก Keycloak และ validate กับ Keycloak server
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "../../auth/auth.service";

@Injectable()
export class KeycloakGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // ดึง Authorization header
    const authHeader = request.headers["authorization"];
    if (!authHeader) {
      throw new UnauthorizedException("No authorization header");
    }

    // ตรวจสอบว่าเป็น Bearer token
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new UnauthorizedException("Invalid authorization header format");
    }

    const token = parts[1];

    // Validate token กับ Keycloak
    const userInfo = await this.authService.validateKeycloakToken(token);

    if (!userInfo) {
      throw new UnauthorizedException("Invalid Keycloak token");
    }

    // เพิ่มข้อมูล user ลงใน request object สำหรับใช้ใน controller
    request.user = {
      id: userInfo.sub,
      username: userInfo.preferred_username,
      email: userInfo.email,
      name: userInfo.name,
      keycloak: true, // flag เพื่อบอกว่ามาจาก Keycloak
    };

    return true;
  }
}
