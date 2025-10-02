# วิธีการเริ่มต้น Keycloak

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
- ตรวจสอบการติดตั้ง Java: `tools\jdk-25\bin\java.exe -version`

### Port ถูกใช้งานอยู่แล้ว
หยุด Keycloak process ที่กำลังทำงานอยู่:
```powershell
Get-Process -Name java | Stop-Process -Force
```

## ตำแหน่งไฟล์ Tools

- **JDK 25**: `tools/jdk-25`
- **Keycloak 26.4.0**: `tools/keycloak-26.4.0`

## เอกสารเพิ่มเติม

สำหรับคำแนะนำการติดตั้งแบบละเอียด ดูที่:
- `KEYCLOAK_SETUP.md` - คู่มือการตั้งค่า Keycloak แบบสมบูรณ์
- `KEYCLOAK_QUICKSTART.md` - แก้ไขปัญหาและคู่มือด่วน
