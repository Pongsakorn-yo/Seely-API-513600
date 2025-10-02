/**
 * ============================================
 * Keycloak Guard (BONUS FEATURE #3)
 * ============================================
 * Guard สำหรับตรวจสอบ authentication ผ่าน Keycloak
 * ใช้แทน JWT Guard เดิมได้
 * 
 * 🎯 Bonus Feature: Keycloak Integration
 * - รองรับ OAuth2/OIDC protocol
 * - ใช้ร่วมกับ JWT authentication ได้
 * - รองรับ SSO (Single Sign-On)
 */

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard, KeycloakConnectOptions } from "nest-keycloak-connect";

/**
 * Keycloak Authentication Guard
 * ใช้สำหรับป้องกัน endpoints ที่ต้องการ authentication
 *
 * การใช้งาน:
 * @UseGuards(KeycloakGuard)
 * @Get('protected')
 * getProtected() { ... }
 */
@Injectable()
export class KeycloakGuard extends AuthGuard {
  /**
   * ตรวจสอบว่า request มี Keycloak token ที่ถูกต้องหรือไม่
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // เรียกใช้ canActivate จาก parent class (AuthGuard)
      const canActivate = await super.canActivate(context);

      if (!canActivate) {
        throw new UnauthorizedException("Invalid or missing Keycloak token");
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException("Authentication failed", error.message);
    }
  }
}
