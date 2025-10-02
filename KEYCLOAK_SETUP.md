# 🔐 Keycloak Integration Setup

## ขั้นตอนการใช้งาน Keycloak กับ Seely API

### 1. ติดตั้ง Keycloak Server

#### วิธีที่ 1: ใช้ Docker (แนะนำ)
```bash
docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest start-dev
```

#### วิธีที่ 2: ดาวน์โหลดและรัน
1. ดาวน์โหลด Keycloak: https://www.keycloak.org/downloads
2. แตกไฟล์และรันคำสั่ง:
```bash
cd keycloak-{version}/bin
./kc.sh start-dev
```

---

### 2. ตั้งค่า Keycloak Admin Console

1. เข้า **Keycloak Admin Console**: http://localhost:8080/admin
2. Login ด้วย username: `admin`, password: `admin`

#### สร้าง Realm ใหม่
1. คลิก dropdown **"Master"** ที่มุมบนซ้าย
2. คลิก **"Create Realm"**
3. ตั้งชื่อ Realm: `seely` 
4. กด **Create**

#### สร้าง Client
1. ไปที่เมนู **Clients** → **Create client**
2. กรอกข้อมูล:
   - **Client ID**: `seely-api`
   - **Client type**: `OpenID Connect`
   - กด **Next**
3. เปิด **Client authentication**: `ON`
4. เปิด **Authorization**: `ON`
5. **Valid redirect URIs**: `http://localhost:3000/*`
6. กด **Save**

#### เก็บ Client Secret
1. ไปที่แท็บ **Credentials**
2. คัดลอก **Client Secret** (จะใช้ใน `.env`)

#### สร้าง User สำหรับทดสอบ
1. ไปที่เมนู **Users** → **Add user**
2. กรอก:
   - **Username**: `testuser`
   - **Email**: `test@example.com`
3. กด **Create**
4. ไปที่แท็บ **Credentials**
5. ตั้งรหัสผ่าน:
   - **Password**: `password123`
   - ปิด **Temporary**: `OFF`
6. กด **Save**

---

### 3. Update Environment Variables

แก้ไขไฟล์ `.env`:

```env
# Keycloak Configuration
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=seely
KEYCLOAK_CLIENT_ID=seely-api
KEYCLOAK_CLIENT_SECRET=your-client-secret-here
KEYCLOAK_PUBLIC_KEY=your-public-key-here
```

**หา Public Key:**
1. ไปที่ Realm Settings → Keys
2. คลิก **Public key** ในแถว RSA
3. คัดลอก key ทั้งหมด

---

### 4. Enable Keycloak ใน Application

แก้ไขไฟล์ `src/app.module.ts`:

```typescript
import {
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
  AuthGuard,
} from 'nest-keycloak-connect';

@Module({
  imports: [
    // ... existing imports

    // เพิ่ม Keycloak Module
    KeycloakConnectModule.register({
      authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL,
      realm: process.env.KEYCLOAK_REALM,
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      secret: process.env.KEYCLOAK_CLIENT_SECRET,
      // Optional: Public Key
      // public Key: process.env.KEYCLOAK_PUBLIC_KEY,
    }),
  ],
  providers: [
    // เพิ่ม Keycloak Guards เป็น Global
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
```

---

### 5. ใช้งาน Keycloak Guards

#### ทำให้ endpoint เป็น Public
```typescript
import { Public } from 'nest-keycloak-connect';

@Controller('series')
export class SeriesController {
  @Public() // ไม่ต้อง authentication
  @Get()
  list() {
    return this.seriesService.list();
  }
}
```

#### ป้องกัน endpoint ด้วย Keycloak
```typescript
import { Roles } from 'nest-keycloak-connect';

@Controller('series')
export class SeriesController {
  @Post() // ใช้ Keycloak authentication อัตโนมัติ
  create(@Body() dto: CreateSeriesDto) {
    return this.seriesService.create(dto);
  }

  @Roles({ roles: ['admin'] }) // เฉพาะ admin เท่านั้น
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.seriesService.remove(id);
  }
}
```

---

### 6. ทดสอบการใช้งาน

#### ขอ Access Token จาก Keycloak
```bash
curl -X POST http://localhost:8080/realms/seely/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=seely-api" \
  -d "client_secret=your-client-secret" \
  -d "username=testuser" \
  -d "password=password123" \
  -d "grant_type=password"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 300
}
```

#### ใช้ Token เรียก API
```bash
curl http://localhost:3000/api/v1/series \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 7. Swagger UI Integration

ตั้งค่า Swagger ให้รองรับ Keycloak OAuth2:

```typescript
// src/main.ts
const config = new DocumentBuilder()
  .setTitle('Seely API')
  .setDescription('Community Series Recommendation API')
  .setVersion('1.0')
  .addBearerAuth() // JWT Authentication
  .addOAuth2({ // Keycloak Authentication
    type: 'oauth2',
    flows: {
      password: {
        tokenUrl: `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
        scopes: {},
      },
    },
  })
  .build();
```

---

## 📊 สรุปความแตกต่าง

| Feature | JWT (Current) | Keycloak |
|---------|--------------|----------|
| User Management | ใน Database | ใน Keycloak Console |
| Token Generation | NestJS + bcrypt | Keycloak Server |
| Token Validation | JWT Strategy | Keycloak Public Key |
| User Roles | Enum ใน Database | Keycloak Roles |
| SSO Support | ❌ | ✅ |
| OAuth2/OIDC | ❌ | ✅ |

---

## 🔄 Migration Path (Optional)

### ใช้ทั้งสองระบบพร้อมกัน

1. เก็บ JWT authentication ไว้สำหรับ legacy clients
2. เพิ่ม Keycloak สำหรับ clients ใหม่
3. ใช้ `@Public()` decorator เพื่อ bypass authentication

---

## 📚 เอกสารเพิ่มเติม

- Keycloak Documentation: https://www.keycloak.org/documentation
- nest-keycloak-connect: https://github.com/ferreir asoft/nest-keycloak-connect
- Keycloak REST API: https://www.keycloak.org/docs-api/latest/rest-api/

---

**หมายเหตุ:** Keycloak เป็น bonus feature ที่ไม่บังคับ แต่จะช่วยเพิ่มความสามารถในการจัดการ authentication แบบมืออาชีพ และรองรับ SSO (Single Sign-On) ได้ 🚀
