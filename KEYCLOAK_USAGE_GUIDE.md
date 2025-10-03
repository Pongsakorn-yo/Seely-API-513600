# 🔐 Keycloak Integration - คู่มือการใช้งาน

## ข้อมูล Keycloak Setup

**Keycloak Server:**
- URL: http://localhost:8080
- Realm: `seely-api`
- Client ID: `seely-api-client`
- Client Secret: `JRurGjK8s2wdu2RnmOwv6p5NEZXHwSCh`

**Test User:**
- Username: `testuser`
- Password: `pass123` (ต้องตั้งใน Keycloak Admin Console)
- Email: test@example.com

---

## วิธีการใช้ Keycloak Token กับ API

### 1️⃣ ขอ Access Token จาก Keycloak

**Request:**
```http
POST http://localhost:8080/realms/seely-api/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
&client_id=seely-api-client
&client_secret=JRurGjK8s2wdu2RnmOwv6p5NEZXHwSCh
&username=testuser
&password=pass123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 300,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "scope": "email profile"
}
```

---

### 2️⃣ ใช้ Token เรียก API

**Request:**
```http
POST http://localhost:3000/api/v1/series
Authorization: Bearer <access_token จากขั้นตอนที่ 1>
Content-Type: application/json

{
  "title": "Stranger Things",
  "year": 2016,
  "reviewDetail": "เรื่องราวของเด็กน้อยในเมืองเล็กๆ ที่ต้องเผชิญกับสิ่งลึกลับจากมิติอื่น",
  "ratingCode": "น13+",
  "recommendedScore": 4.5
}
```

---

### 3️⃣ ใช้ JWT Token (ของ API เอง)

**วิธีการ Login ด้วย JWT:**
```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "pass123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "role": "USER"
  }
}
```

---

## 🎯 Flexible Authentication

API รองรับ **2 แบบ**:

### ✅ แบบที่ 1: JWT Token (จาก /auth/login)
```
Authorization: Bearer <JWT_TOKEN>
```

### ✅ แบบที่ 2: Keycloak Token
```
Authorization: Bearer <KEYCLOAK_TOKEN>
```

`FlexibleAuthGuard` จะตรวจสอบทั้ง 2 แบบอัตโนมัติ:
1. พยายามตรวจสอบด้วย JWT ก่อน
2. ถ้าล้มเหลว จะลองตรวจสอบด้วย Keycloak
3. ถ้าทั้ง 2 แบบล้มเหลว จะ return 401 Unauthorized

---

## 📝 Postman Collection

### ตั้งค่า Environment Variables:
```
keycloak_url = http://localhost:8080
realm = seely-api
client_id = seely-api-client
client_secret = JRurGjK8s2wdu2RnmOwv6p5NEZXHwSCh
api_url = http://localhost:3000
```

### Pre-request Script (เพื่อขอ Keycloak token อัตโนมัติ):
```javascript
pm.sendRequest({
    url: pm.environment.get("keycloak_url") + "/realms/" + pm.environment.get("realm") + "/protocol/openid-connect/token",
    method: 'POST',
    header: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: {
        mode: 'urlencoded',
        urlencoded: [
            {key: "grant_type", value: "password"},
            {key: "client_id", value: pm.environment.get("client_id")},
            {key: "client_secret", value: pm.environment.get("client_secret")},
            {key: "username", value: "testuser"},
            {key: "password", value: "pass123"}
        ]
    }
}, function (err, res) {
    if (err) {
        console.log(err);
    } else {
        const jsonData = res.json();
        pm.environment.set("keycloak_token", jsonData.access_token);
    }
});
```

---

## 🔧 Troubleshooting

### ❌ Error: "Invalid token (tried both JWT and Keycloak)"

**สาเหตุที่เป็นไปได้:**

1. **Token หมดอายุ** - Keycloak token มีอายุแค่ 5 นาที (300 seconds)
   - **แก้ไข:** ขอ token ใหม่

2. **User ไม่มีใน Keycloak**
   - **แก้ไข:** สร้าง user ใน Keycloak Admin Console (http://localhost:8080)
   - ไปที่ Realm: seely-api → Users → Add User
   - ตั้ง username: testuser
   - ตั้ง password: pass123 (ใน Credentials tab, ปิด "Temporary")

3. **Client Secret ไม่ถูกต้อง**
   - **แก้ไข:** ตรวจสอบใน Keycloak Admin Console
   - ไปที่ Clients → seely-api-client → Credentials → Client Secret

4. **Keycloak ไม่ได้รัน**
   - **แก้ไข:** รัน Keycloak ด้วย `.\start-keycloak.ps1`

---

## 📊 ตรวจสอบ Token

### ดู JWT Token Payload:
ใช้ https://jwt.io เพื่อ decode token

### ตรวจสอบ Keycloak Token:
```http
POST http://localhost:8080/realms/seely-api/protocol/openid-connect/token/introspect
Content-Type: application/x-www-form-urlencoded

token=<YOUR_TOKEN>
&client_id=seely-api-client
&client_secret=JRurGjK8s2wdu2RnmOwv6p5NEZXHwSCh
```

---

## 🎓 Best Practices

1. **Development**: ใช้ JWT token (ง่ายกว่า ไม่ต้องรัน Keycloak)
2. **Production**: ใช้ Keycloak token (ปลอดภัยกว่า มี SSO)
3. **Testing**: ทดสอบทั้ง 2 แบบเพื่อให้มั่นใจว่า Flexible Auth ทำงานถูกต้อง

---

## 📞 API Endpoints ที่รองรับ Keycloak

✅ **Series Endpoints** (ต้อง login):
- POST /api/v1/series - สร้างซีรีย์ใหม่
- PATCH /api/v1/series/:id - แก้ไขซีรีย์ (เจ้าของเท่านั้น)
- DELETE /api/v1/series/:id - ลบซีรีย์ (เจ้าของเท่านั้น)

✅ **Reviews Endpoints** (ต้อง login):
- POST /api/v1/reviews - สร้าง review ใหม่

❌ **Public Endpoints** (ไม่ต้อง login):
- GET /api/v1/series - ดูรายการซีรีย์ทั้งหมด
- GET /api/v1/series/:id - ดูรายละเอียดซีรีย์
- GET /api/v1/series/:id/reviews - ดู reviews ของซีรีย์

---

## 🚀 Quick Start

1. เปิด Keycloak: `.\start-keycloak.ps1`
2. เปิด API: `npm run start:dev`
3. สร้าง user ใน Keycloak Admin Console
4. ขอ token ด้วย password grant
5. ใช้ token เรียก API

**Happy Coding! 🎉**
