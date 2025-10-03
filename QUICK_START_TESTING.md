# 🚀 Quick Start - การทดสอบ Seely API ด้วย Postman

## 📥 Import ไฟล์เข้า Postman

### วิธีที่ 1: Import Collection และ Environment

1. เปิด Postman
2. คลิก **Import** (มุมซ้ายบน)
3. ลากไฟล์ทั้งสองนี้เข้ามา:
   - `Seely-API.postman_collection.json`
   - `Seely-API-Local.postman_environment.json`
4. คลิก **Import**
5. เลือก Environment "Seely API - Local" ในมุมขวาบน

### วิธีที่ 2: Copy-Paste JSON

1. เปิด Postman → **Import**
2. เลือกแท็บ **Raw text**
3. Copy JSON จากไฟล์แล้ว Paste
4. คลิก **Continue** → **Import**

---

## ▶️ เริ่มทดสอบ (5 นาที)

### ขั้นตอนที่ 1: เตรียม Server
```powershell
# รัน Server
npm run start:dev

# ตรวจสอบว่ารันอยู่
# ควรเห็น: 🚀 Seely API running on http://localhost:3000
```

### ขั้นตอนที่ 2: ทดสอบตามลำดับ

เปิด Collection **"Seely API - Complete Test Suite"** แล้ว run folder ตามลำดับ:

#### 1️⃣ User Management (4 requests)
- ✅ สร้าง User 3 คน
- ✅ ทดสอบ Validation

**คลิกขวาที่ folder "1. User Management" → Run folder**

**ผลลัพธ์ที่ต้องการ:**
- 3 requests สำเร็จ (201 Created)
- 1 request ล้มเหลว (400 Bad Request - validation)

---

#### 2️⃣ Authentication (5 requests)
- ✅ Login User ทั้ง 3 คน
- ✅ บันทึก tokens อัตโนมัติ
- ✅ ทดสอบ Refresh Token

**คลิกขวาที่ folder "2. Authentication" → Run folder**

**ผลลัพธ์:**
- Login สำเร็จ (200 OK)
- Password ผิดล้มเหลว (401 Unauthorized)
- Refresh token ทำงาน

---

#### 3️⃣ Series CRUD (11 requests)
- ✅ สร้างซีรีย์ 3 เรื่อง
- ✅ ดูรายการแบบ Pagination
- ✅ แก้ไข/ลบ (เฉพาะ owner)

**คลิกขวาที่ folder "3. Series CRUD" → Run folder**

**ผลลัพธ์:**
- สร้างสำเร็จ 3 เรื่อง
- Pagination ทำงาน
- Owner ลบ/แก้ไขได้
- คนอื่นทำไม่ได้ (403 Forbidden)

---

#### 4️⃣ Reviews (8 requests)
- ✅ User 2, 3 รีวิว Breaking Bad
- ✅ averageScore คำนวณถูกต้อง (9.5)
- ✅ reviewCount เพิ่มขึ้น

**คลิกขวาที่ folder "4. Reviews" → Run folder**

**ผลลัพธ์:**
- รีวิวสำเร็จ
- คะแนนเฉลี่ย = (9 + 10) / 2 = **9.5** ✅
- reviewCount = **2** ✅

---

#### 5️⃣ Keycloak (3 requests) - **BONUS**
- ✅ รับ Keycloak token
- ✅ ใช้ token สร้างซีรีย์

**⚠️ ต้องรัน Keycloak ก่อน:**
```powershell
.\start-keycloak.ps1
```

---

## 📊 ตรวจสอบผลลัพธ์

### ✅ Checklist ทั้งหมด (27 requests)

| Category | Total | Pass | Description |
|----------|-------|------|-------------|
| User Management | 4 | 3 pass, 1 fail (expected) | สร้าง user + validation |
| Authentication | 5 | 4 pass, 1 fail (expected) | Login + refresh token |
| Series CRUD | 11 | 9 pass, 2 fail (expected) | CRUD + pagination + ownership |
| Reviews | 8 | 7 pass, 1 fail (expected) | รีวิว + คะแนนเฉลี่ย |
| Keycloak | 3 | 3 pass (if running) | SSO integration |

**Total: 23-26 pass / 27 requests** (ขึ้นอยู่กับว่ารัน Keycloak หรือไม่)

---

## 🎯 การทดสอบแบบละเอียด

### วิธีที่ 1: Run ทีละ Folder
1. คลิกขวาที่ folder
2. เลือก **Run folder**
3. ดูผลลัพธ์ใน Runner

### วิธีที่ 2: Run ทีละ Request
1. คลิกที่ request
2. กด **Send**
3. ตรวจสอบ:
   - Status Code
   - Response Body
   - Tests (เครื่องหมายถูก/ผิด)

### วิธีที่ 3: Run ทั้ง Collection
1. คลิกขวาที่ Collection
2. **Run collection**
3. ดูสรุปทั้งหมด

---

## 🔍 จุดสำคัญที่ต้องตรวจสอบ

### 1. User Management
```json
POST /api/v1/users
{
  "username": "reviewer1",
  "password": "password123"
}
```
**ตรวจสอบ:**
- ✅ Response ไม่มี `password` (security)
- ✅ Validation ทำงาน (username < 3 ตัวอักษรต้องล้มเหลว)

### 2. Authentication
```json
POST /api/v1/auth/login
{
  "username": "reviewer1",
  "password": "password123"
}
```
**ตรวจสอบ:**
- ✅ ได้ `access_token` และ `refresh_token`
- ✅ Token เป็น JWT format
- ✅ Password ผิดต้อง 401 Unauthorized

### 3. Series CRUD
```json
POST /api/v1/series
Headers: Authorization: Bearer {token}
{
  "title": "Breaking Bad",
  "rating": "น 18+",
  "year": 2008,
  ...
}
```
**ตรวจสอบ:**
- ✅ ต้อง login ก่อน (มี token)
- ✅ `rating` ต้องเป็น 1 ใน 6 ค่า
- ✅ `averageScore` เริ่มต้นเป็น 0
- ✅ `reviewCount` เริ่มต้นเป็น 0

### 4. Pagination
```
GET /api/v1/series?page=1&limit=2
```
**ตรวจสอบ:**
- ✅ ไม่ต้อง login
- ✅ Response มี `data`, `total`, `page`, `limit`
- ✅ Default limit = 10 (ถ้าไม่ระบุ)

### 5. Ownership
```
PATCH /api/v1/series/1
Headers: Authorization: Bearer {user2_token}
```
**ตรวจสอบ:**
- ✅ Owner แก้ไขได้ (200 OK)
- ✅ คนอื่นแก้ไขไม่ได้ (403 Forbidden)

### 6. Reviews & Average Score
```json
POST /api/v1/reviews
{
  "seriesId": 1,
  "score": 9,
  "comment": "เยี่ยมมาก!"
}
```
**ตรวจสอบ:**
- ✅ ต้อง login ก่อน
- ✅ averageScore คำนวณถูกต้อง
  - รีวิวที่ 1: score = 9 → average = 9
  - รีวิวที่ 2: score = 10 → average = (9+10)/2 = 9.5
- ✅ reviewCount เพิ่มขึ้นทุกครั้ง

---

## 📈 ตัวอย่างผลลัพธ์ที่ถูกต้อง

### Breaking Bad หลังรีวิว 2 ครั้ง:
```json
{
  "id": 1,
  "title": "Breaking Bad",
  "averageScore": 9.5,
  "reviewCount": 2,
  "reviewerScore": 10,
  ...
}
```

**การคำนวณ:**
- User 2 ให้ 9 คะแนน
- User 3 ให้ 10 คะแนน
- Average = (9 + 10) / 2 = **9.5** ✅

---

## 🐛 Troubleshooting

### ❌ Error: "Could not send request"
**แก้ไข:** ตรวจสอบว่า server รันอยู่
```powershell
npm run start:dev
```

### ❌ Error: 401 Unauthorized
**แก้ไข:** 
1. Run request "Login User 1" ก่อน
2. Token จะถูกบันทึกอัตโนมัติใน Environment
3. ลองรัน request อีกครั้ง

### ❌ Error: 403 Forbidden
**แก้ไข:** 
- ถูกต้องแล้ว! คุณกำลังพยายามแก้ไขซีรีย์ของคนอื่น
- ใช้ token ของ owner แทน

### ❌ Keycloak Error
**แก้ไข:**
```powershell
# รัน Keycloak
.\start-keycloak.ps1

# รอ 30 วินาที แล้วเข้า
# http://localhost:8080
```

---

## 💡 Tips

### 1. ดู Console ของ Postman
- เปิด **View** → **Show Postman Console**
- ดู log การบันทึก tokens และ IDs

### 2. ดู Tests Results
- หลังส่ง request ดูแท็บ **Test Results**
- เครื่องหมาย ✅ = ผ่าน
- เครื่องหมาย ❌ = ไม่ผ่าน

### 3. Export Results
- หลัง Run folder/collection
- คลิก **Export Results**
- ส่งให้อาจารย์เป็นหลักฐาน

---

## 🎓 สรุปการทดสอบตามโจทย์

### ✅ Business Requirements

| Requirement | Endpoint | Test |
|-------------|----------|------|
| ผู้แนะนำสร้างซีรีย์ | POST /series | ✅ Pass |
| ผู้แนะนำแก้ไขซีรีย์ตัวเอง | PATCH /series/:id | ✅ Pass (owner) |
| ผู้ให้คะแนนรีวิวได้ | POST /reviews | ✅ Pass |
| คนทั่วไปดูรายการได้ | GET /series | ✅ Pass (no auth) |
| แสดงคะแนนเฉลี่ย | GET /series | ✅ averageScore |
| แสดงจำนวนรีวิว | GET /series | ✅ reviewCount |
| Pagination default 10 | GET /series | ✅ limit=10 |

### ✅ Technical Requirements

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Nest CLI (nest new) | ✅ | โครงสร้างโปรเจกต์ |
| nest generate resource | ✅ | users, series, reviews |
| TypeORM + Database | ✅ | PostgreSQL connection |
| REST API | ✅ | 14 endpoints |
| Validation (nestjs-zod) | ✅ | Rating validation test |
| bcrypt password | ✅ | No password in response |
| JWT Authentication | ✅ | Login + refresh token |
| Authorization (Owner) | ✅ | 403 Forbidden test |
| Read สำหรับทุกคน | ✅ | GET /series no auth |
| Pagination | ✅ | page & limit params |
| **Bonus: Keycloak** | ✅ | SSO integration |
| **Bonus: Tests** | ✅ | 23 unit + 8 e2e |

---

## 📸 หลักฐานการทดสอบ

### 1. Screenshot ที่ควรมี:
- ✅ Postman Runner แสดงผลลัพธ์ทั้งหมด
- ✅ GET /series แสดง averageScore และ reviewCount
- ✅ PATCH /series ด้วย user อื่น แสดง 403 Forbidden
- ✅ POST /reviews แสดงการคำนวณคะแนนเฉลี่ย

### 2. Export Collection:
```
Postman → Collection → ... → Export
```
- ส่งไฟล์ `.json` เป็นหลักฐาน

### 3. การ Export ผลลัพธ์:
```
Runner → Export Results → JSON/HTML
```

---

## 🚀 เริ่มทดสอบเลย!

```powershell
# 1. รัน Server
npm run start:dev

# 2. เปิด Postman

# 3. Import Collection และ Environment

# 4. Run Collection!
```

**เวลาทั้งหมด: ~5 นาที**

---

## ✨ Bonus: Auto-test Script

เพิ่มใน Collection Settings → Pre-request Scripts:

```javascript
// Auto-set base URL
pm.environment.set("base_url", "http://localhost:3000/api/v1");

// Log current request
console.log(`Running: ${pm.info.requestName}`);
```

---

**Good luck with your testing! 🎉**
