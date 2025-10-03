# 🔐 Keycloak Integration Guide

## Overview
Seely API รองรับ Keycloak authentication เป็น Bonus Feature ที่ช่วยให้สามารถใช้ SSO (Single Sign-On) และ OAuth2/OpenID Connect ได้

## Prerequisites
- Keycloak 25.0.4+ (มีในโปรเจคแล้วที่ `./keycloak-25.0.4`)
- Java 17+ (มีในโปรเจคแล้วที่ `./jdk-17`)
- PostgreSQL running

## Quick Start

### 1. Start Keycloak Server
```powershell
.\start-keycloak.ps1
```

Server จะรันที่: **http://localhost:8080**
- Admin Console: http://localhost:8080/admin/master/console/
- Username: `admin`
- Password: `admin`

### 2. Configure Keycloak Realm

#### 2.1 Create Realm
1. เข้า Admin Console
2. Click **Create Realm**
3. Realm name: `seely-api`
4. Click **Create**

#### 2.2 Create Client
1. ใน realm `seely-api` ไปที่ **Clients** → **Create client**
2. กรอกข้อมูล:
   - Client ID: `seely-api-client`
   - Client authentication: **ON**
   - Valid redirect URIs: `http://localhost:3000/*`
   - Web origins: `*`
3. Save แล้วไปที่ tab **Credentials**
4. Copy **Client Secret** มาใส่ใน `.env`

#### 2.3 Create User
1. ไปที่ **Users** → **Create user**
2. กรอกข้อมูล:
   - Username: `testuser`
   - Email: `test@example.com`
   - First name: `test`
   - Last name: `test`
   - Email verified: **ON**
3. Save แล้วไปที่ tab **Credentials**
4. Set password: `pass123`
5. Temporary: **OFF**

### 3. Update .env File
```env
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=seely-api
KEYCLOAK_CLIENT_ID=seely-api-client
KEYCLOAK_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
APP_URL=http://localhost:3000
```

### 4. Start NestJS API
```bash
npm run start:dev
```

## Usage

### Method 1: Browser Login Flow (Recommended)

#### Step 1: Redirect to Keycloak Login
เปิด browser ไปที่:
```
http://localhost:3000/api/v1/auth/keycloak/login
```

#### Step 2: Login with Keycloak
- จะถูก redirect ไปหน้า login ของ Keycloak
- ใส่ username: `testuser` และ password: `pass123`

#### Step 3: Get Tokens
- หลัง login สำเร็จจะได้ response กลับมา:
```json
{
  "message": "Login with Keycloak successful",
  "tokens": {
    "access_token": "eyJhbGci...",
    "expires_in": 300,
    "refresh_token": "eyJhbGci...",
    "token_type": "Bearer"
  },
  "user": {
    "sub": "6d279fea-07fd-4af1-869c-a138b2b1cf43",
    "email": "test@example.com",
    "preferred_username": "testuser",
    "name": "test test"
  }
}
```

#### Step 4: Use Access Token
Copy `access_token` แล้วใช้เรียก API:
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:3000/api/v1/series
```

### Method 2: Direct Token Request (For Testing)

```bash
curl -X POST "http://localhost:8080/realms/seely-api/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=seely-api-client" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "username=testuser" \
  -d "password=pass123"
```

## Protecting Endpoints with Keycloak Guard

### Example: Protect Series Endpoints

```typescript
import { UseGuards } from '@nestjs/common';
import { KeycloakGuard } from '../common/guards/keycloak.guard';

@Controller('series')
export class SeriesController {
  
  // Public endpoint - ไม่ต้อง login
  @Get()
  findAll() { }
  
  // Protected with Keycloak - ต้อง login ด้วย Keycloak token
  @Post()
  @UseGuards(KeycloakGuard)
  create() { }
}
```

### Access User Info in Controller

```typescript
@Post()
@UseGuards(KeycloakGuard)
create(@Request() req) {
  const user = req.user;
  // user.id - Keycloak user ID
  // user.username - Username
  // user.email - Email
  // user.name - Full name
  // user.keycloak - true (flag ว่ามาจาก Keycloak)
}
```

## API Endpoints

### Keycloak Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/keycloak/login` | Redirect ไป Keycloak login page |
| GET | `/api/v1/auth/keycloak/callback` | Callback หลัง login สำเร็จ |

### Standard JWT Endpoints (ยังใช้ได้ปกติ)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | สมัครสมาชิก |
| POST | `/api/v1/auth/login` | Login ด้วย JWT |
| POST | `/api/v1/auth/refresh` | Refresh JWT token |

## Testing

### Test Keycloak Token Validation

```bash
# 1. Get Keycloak token
TOKEN=$(curl -s -X POST "http://localhost:8080/realms/seely-api/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=seely-api-client&client_secret=YOUR_SECRET&username=testuser&password=pass123" \
  | jq -r '.access_token')

# 2. Use token to call API
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/series
```

### Postman Collection

1. **Get Token**
   - Method: POST
   - URL: `http://localhost:8080/realms/seely-api/protocol/openid-connect/token`
   - Body (x-www-form-urlencoded):
     ```
     grant_type: password
     client_id: seely-api-client
     client_secret: YOUR_SECRET
     username: testuser
     password: pass123
     ```

2. **Call Protected API**
   - Method: GET
   - URL: `http://localhost:3000/api/v1/series`
   - Headers:
     ```
     Authorization: Bearer {{access_token}}
     ```

## Architecture

```
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│   Browser   │          │  Seely API  │          │  Keycloak   │
└──────┬──────┘          └──────┬──────┘          └──────┬──────┘
       │                        │                        │
       │ 1. GET /keycloak/login │                        │
       ├───────────────────────>│                        │
       │                        │                        │
       │ 2. Redirect to KC      │                        │
       │<───────────────────────┤                        │
       │                        │                        │
       │ 3. Login page          │                        │
       ├────────────────────────────────────────────────>│
       │                        │                        │
       │ 4. Auth code           │                        │
       │<────────────────────────────────────────────────┤
       │                        │                        │
       │ 5. GET /callback?code= │                        │
       ├───────────────────────>│                        │
       │                        │ 6. Exchange code       │
       │                        ├───────────────────────>│
       │                        │                        │
       │                        │ 7. Access token        │
       │                        │<───────────────────────┤
       │                        │                        │
       │ 8. Return tokens       │                        │
       │<───────────────────────┤                        │
       │                        │                        │
       │ 9. API call with token │                        │
       ├───────────────────────>│                        │
       │                        │ 10. Validate token     │
       │                        ├───────────────────────>│
       │                        │                        │
       │                        │ 11. User info          │
       │                        │<───────────────────────┤
       │                        │                        │
       │ 12. API response       │                        │
       │<───────────────────────┤                        │
```

## Token Lifecycle

### Access Token
- **Lifetime**: 5 minutes (300 seconds)
- **Purpose**: เรียก API
- **Validation**: ตรวจสอบกับ Keycloak ทุกครั้ง

### Refresh Token
- **Lifetime**: 30 minutes (1800 seconds)
- **Purpose**: ขอ access token ใหม่เมื่อหมดอายุ

### Refresh Token Request

```bash
curl -X POST "http://localhost:8080/realms/seely-api/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "client_id=seely-api-client" \
  -d "client_secret=YOUR_SECRET" \
  -d "refresh_token=YOUR_REFRESH_TOKEN"
```

## Troubleshooting

### Error: "Invalid Keycloak token"
- ตรวจสอบว่า Keycloak server รันอยู่
- ตรวจสอบว่า realm name และ client ID ถูกต้อง
- ตรวจสอบว่า token ยังไม่หมดอายุ

### Error: "Failed to exchange code for token"
- ตรวจสอบ client secret ใน `.env`
- ตรวจสอบ redirect URI ใน Keycloak client config
- ตรวจสอบว่า Keycloak server รันที่ port 8080

### Error: "No authorization header"
- ตรวจสอบว่าใส่ header `Authorization: Bearer <token>` แล้ว

## Security Best Practices

1. **Production Deployment**:
   - เปลี่ยน admin password ของ Keycloak
   - ใช้ HTTPS สำหรับทั้ง API และ Keycloak
   - ตั้งค่า CORS policy ให้เหมาะสม

2. **Token Management**:
   - เก็บ access token ใน memory เท่านั้น (ไม่ใส่ localStorage)
   - ใช้ refresh token rotation
   - Implement token revocation

3. **Client Configuration**:
   - เปิด Client authentication (confidential client)
   - กำหนด Valid redirect URIs ที่ชัดเจน
   - จำกัด Web origins

## Comparison: JWT vs Keycloak

| Feature | JWT (Built-in) | Keycloak |
|---------|---------------|----------|
| Setup | ง่าย | ซับซ้อนกว่า |
| SSO | ❌ | ✅ |
| User Management | Manual | UI Admin Console |
| OAuth2/OIDC | ❌ | ✅ |
| Enterprise Features | Limited | Full-featured |
| Performance | Fast | Slower (external call) |
| Use Case | Simple apps | Enterprise apps |

## Conclusion

Keycloak integration เป็น **Bonus Feature** ที่เหมาะสำหรับ:
- ✅ Enterprise applications
- ✅ Multi-application SSO
- ✅ Advanced user management
- ✅ OAuth2/OpenID Connect requirements

สำหรับ simple applications **JWT authentication** ที่มีอยู่แล้วก็เพียงพอ! 🎉

---

**ทดสอบแล้ว**: October 3, 2025  
**Keycloak Version**: 25.0.4  
**Status**: ✅ Working
