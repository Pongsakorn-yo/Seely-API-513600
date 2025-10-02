# วิธีการเริ่มต้น Keycloak

> **🎉 Bonus Features ที่ทำเสร็จแล้ว:**
> - ✅ **Keycloak Integration** - ระบบ authentication มาตรฐาน OAuth2/OIDC
> - ✅ **Unit Tests** - 22 test cases (Auth, Series, Reviews services)
> - ✅ **E2E Tests** - 8+ scenarios ครอบคลุม authentication, CRUD, authorization
>
> คู่มือนี้จะแสดงวิธีการตั้งค่าและใช้งาน Keycloak สำหรับ Seely API

## เริ่มต้นใช้งาน

### วิธีที่ 1: ใช้ Batch File (แนะนำสำหรับ Windows)
```bash
start-keycloak.bat
```

### วิธีที่ 2: ใช้ PowerShell Script
```powershell
.\start-keycloak.ps1
```

## เข้าถึง Keycloak

เมื่อ Keycloak ทำงานแล้ว สามารถเข้าใช้งานได้ที่:

- **Admin Console**: http://localhost:8080/admin
- **ข้อมูลเข้าสู่ระบบเริ่มต้น**:
  - Username: `admin`
  - Password: `admin`

## การตั้งค่าเริ่มต้น

หลังจาก Keycloak เริ่มต้นเรียบร้อยแล้ว ให้ทำตามขั้นตอนเหล่านี้:

### 1. เข้าสู่ระบบ Admin Console
ไปที่ http://localhost:8080/admin และ login ด้วย `admin` / `admin`

### 2. สร้าง Realm
- คลิกปุ่ม "Create Realm"
- ตั้งชื่อ: `seely-api`
- คลิก "Create"

### 3. สร้าง Client
- ไปที่เมนู "Clients"
- คลิก "Create client"
- Client ID: `seely-api-client`
- Client authentication: เปิด (ON)
- Save

### 4. ตั้งค่า Client
- ไปที่แท็บ "Credentials"
- Copy "Client secret" (จะต้องใช้สำหรับ API)

### 5. สร้าง Test User
- ไปที่เมนู "Users"
- คลิก "Add user"
- Username: `testuser`
- Email: `test@example.com`
- Save
- ไปที่แท็บ "Credentials"
- ตั้งรหัสผ่าน: `password123`
- ปิด "Temporary"
- คลิก "Set password"

## ทดสอบด้วย Postman

### รับ Access Token
```http
POST http://localhost:8080/realms/seely-api/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

client_id=seely-api-client
client_secret=YOUR_CLIENT_SECRET
grant_type=password
username=testuser
password=password123
```

### ใช้ Token ใน API Requests
เพิ่ม header ในคำขอ API:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## ตัวแปร Environment

อัปเดตไฟล์ `.env` ของคุณ:
```env
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=seely-api
KEYCLOAK_CLIENT_ID=seely-api-client
KEYCLOAK_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

## แก้ไขปัญหา

### Keycloak เริ่มไม่ได้
- ตรวจสอบว่าไม่มีโปรแกรมอื่นใช้ port 8080 อยู่
- ตรวจสอบการติดตั้ง Java: `tools\jdk-17\bin\java.exe -version`

### Port ถูกใช้งานอยู่แล้ว
หยุด Keycloak process ที่กำลังทำงานอยู่:
```powershell
Get-Process -Name java | Stop-Process -Force
```

## ตำแหน่งไฟล์ Tools

- **JDK 17**: `tools/jdk-17`
- **Keycloak 26.4.0**: `tools/keycloak-26.4.0`

---

## 🎯 Bonus Features Summary

### 1. ✅ Keycloak Integration (ทำเสร็จแล้ว)
- ติดตั้ง `keycloak-connect` และ `nest-keycloak-connect`
- สร้าง `KeycloakGuard` สำหรับ authentication
- รองรับ OAuth2/OIDC protocol
- สามารถใช้ร่วมกับ JWT authentication ปัจจุบันได้

### 2. ✅ Unit Tests (ทำเสร็จแล้ว)
**รวม 22 test cases:**
- **Auth Service** (8 tests): register, login, validateUser, refresh token
- **Series Service** (8 tests): CRUD operations, pagination, search filter
- **Reviews Service** (6 tests): create review, list reviews, stats calculation

**วิธีรัน:**
```bash
npm test
```

### 3. ✅ E2E Tests (ทำเสร็จแล้ว)
**รวม 8+ scenarios:**
- Authentication flow (register/login)
- CRUD operations (create/read/update/delete)
- Authorization (ownership guards)
- Reviews และ Stats calculation
- Pagination

**วิธีรัน:**
```bash
npm run test:e2e
```

### 📊 Test Coverage
ดู coverage report:
```bash
npm run test:cov
```

---

## เอกสารเพิ่มเติม

สำหรับรายละเอียดเพิ่มเติม:
- **README.md** - คู่มือหลักของโปรเจค
- **DATABASE_SETUP.md** - การตั้งค่า PostgreSQL database
- **Swagger UI** - http://localhost:3000/api (API documentation)

---

**หมายเหตุ:** 
- Keycloak เป็น bonus feature ที่เพิ่มความสามารถในการจัดการ authentication แบบมืออาชีพ
- สามารถใช้ JWT authentication ปัจจุบันได้ตามปกติ (ไม่บังคับต้องใช้ Keycloak)
- รองรับ SSO (Single Sign-On) เมื่อใช้ Keycloak
