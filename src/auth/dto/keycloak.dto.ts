import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// Keycloak Token Response Schema
export const KeycloakTokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  refresh_expires_in: z.number(),
  refresh_token: z.string(),
  token_type: z.string(),
  scope: z.string(),
});

export class KeycloakTokenResponseDto extends createZodDto(
  KeycloakTokenResponseSchema,
) {}

// Keycloak User Info Schema
export const KeycloakUserInfoSchema = z.object({
  sub: z.string(),
  email_verified: z.boolean().optional(),
  name: z.string().optional(),
  preferred_username: z.string(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  email: z.string().optional(),
});

export class KeycloakUserInfoDto extends createZodDto(KeycloakUserInfoSchema) {}

// Keycloak Callback Query Schema
export const KeycloakCallbackQuerySchema = z.object({
  code: z.string(),
  state: z.string().optional(),
});

export class KeycloakCallbackQueryDto extends createZodDto(
  KeycloakCallbackQuerySchema,
) {}
