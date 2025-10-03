# 📋 คู่มือการทดสอบ Seely API ด้วย Postman

## 📑 สารบัญ
1. [เตรียมความพร้อม](#เตรียมความพร้อม)
2. [ทดสอบการสร้าง User](#1-ทดสอบการสร้าง-user)
3. [ทดสอบการ Login](#2-ทดสอบการ-login)
4. [ทดสอบการสร้างซีรีย์](#3-ทดสอบการสร้างซีรีย)
5. [ทดสอบการดูรายการซีรีย์](#4-ทดสอบการดรายการซรย-pagination)
6. [ทดสอบการแก้ไขซีรีย์](#5-ทดสอบการแกไขซรย-ownership)
7. [ทดสอบการรีวิวซีรีย์](#6-ทดสอบการรววซรย)
8. [ทดสอบ Refresh Token](#7-ทดสอบ-refresh-token)
9. [ทดสอบ Keycloak (Bonus)](#8-ทดสอบ-keycloak-bonus)
10. [Postman Collection](#postman-collection)

---

## เตรียมความพร้อม

### ✅ ข้อกำหนดเบื้องต้น
- ✔️ Postman ติดตั้งแล้ว ([ดาวน์โหลด](https://www.postman.com/downloads/))
- ✔️ Server รันอยู่ที่ `http://localhost:3000`
- ✔️ Database PostgreSQL พร้อมใช้งาน
- ✔️ (Optional) Keycloak รันอยู่ที่ `http://localhost:8080`

### 🔧 ตั้งค่า Postman Environment

1. เปิด Postman → คลิก **Environments** (ซ้ายมือ)
2. คลิก **+** สร้าง Environment ใหม่ชื่อ `Seely API - Local`
3. เพิ่ม Variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:3000/api/v1` | `http://localhost:3000/api/v1` |
| `access_token` | (ว่างไว้) | (ว่างไว้) |
| `refresh_token` | (ว่างไว้) | (ว่างไว้) |
| `user1_id` | (ว่างไว้) | (ว่างไว้) |
| `user2_id` | (ว่างไว้) | (ว่างไว้) |
| `series_id` | (ว่างไว้) | (ว่างไว้) |

4. คลิก **Save**
5. เลือก Environment นี้ในมุมขวาบน

---

## 📝 ขั้นตอนการทดสอบแบบละเอียด

## 1. ทดสอบการสร้าง User

### 🎯 วัตถุประสงค์
- ทดสอบว่าสามารถสร้าง User ได้
- ทดสอบ password encryption ด้วย bcrypt
- ทดสอบ input validation

### 📤 Request: สร้าง User คนที่ 1 (ผู้แนะนำซีรีย์)

```
Method: POST
URL: {{base_url}}/users
Headers:
  Content-Type: application/json
Body (raw JSON):
```

```json
{
  "username": "reviewer1",
  "password": "password123"
}
```

### ✅ Expected Response (201 Created):
```json
{
  "id": 1,
  "username": "reviewer1",
  "createdAt": "2025-10-03T08:00:00.000Z",
  "updatedAt": "2025-10-03T08:00:00.000Z"
}
```

### 📋 สิ่งที่ต้องตรวจสอบ:
- ✅ Status Code = `201 Created`
- ✅ Response มี `id`, `username`
- ✅ Response **ไม่มี** `password` (เพื่อความปลอดภัย)
- ✅ `createdAt` และ `updatedAt` มีค่า

### 💾 บันทึก User ID:
ใน **Tests** tab ของ Postman เพิ่ม script:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("user1_id", response.id);
    console.log("User 1 ID saved:", response.id);
}
```

---

### 📤 Request: สร้าง User คนที่ 2 (ผู้ให้คะแนน)

```
Method: POST
URL: {{base_url}}/users
Body (raw JSON):
```

```json
{
  "username": "rater1",
  "password": "password456"
}
```

### 💾 บันทึก User ID:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("user2_id", response.id);
    console.log("User 2 ID saved:", response.id);
}
```

---

### 📤 Request: ทดสอบ Validation (ควรล้มเหลว)

```
Method: POST
URL: {{base_url}}/users
Body (raw JSON):
```

```json
{
  "username": "ab",
  "password": "12345"
}
```

### ❌ Expected Response (400 Bad Request):
```json
{
  "message": [
    "username must be at least 3 characters",
    "password must be at least 6 characters"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 2. ทดสอบการ Login

### 🎯 วัตถุประสงค์
- ทดสอบ JWT Authentication
- ทดสอบการ Login สำเร็จ
- ทดสอบการ Login ล้มเหลว
- บันทึก Access Token และ Refresh Token

### 📤 Request: Login User 1

```
Method: POST
URL: {{base_url}}/auth/login
Headers:
  Content-Type: application/json
Body (raw JSON):
```

```json
{
  "username": "reviewer1",
  "password": "password123"
}
```

### ✅ Expected Response (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "reviewer1"
  }
}
```

### 📋 สิ่งที่ต้องตรวจสอบ:
- ✅ Status Code = `200 OK`
- ✅ มี `access_token` (JWT ที่อายุ 15 นาที)
- ✅ มี `refresh_token` (JWT ที่อายุ 7 วัน)
- ✅ มี `user` object พร้อมข้อมูล

### 💾 บันทึก Tokens (เพิ่มใน Tests tab):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.access_token);
    pm.environment.set("refresh_token", response.refresh_token);
    console.log("Tokens saved successfully");
    console.log("Access Token:", response.access_token.substring(0, 50) + "...");
}
```

---

### 📤 Request: Login ล้มเหลว (รหัสผ่านผิด)

```
Method: POST
URL: {{base_url}}/auth/login
Body (raw JSON):
```

```json
{
  "username": "reviewer1",
  "password": "wrongpassword"
}
```

### ❌ Expected Response (401 Unauthorized):
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

---

## 3. ทดสอบการสร้างซีรีย์

### 🎯 วัตถุประสงค์
- ทดสอบว่าต้อง login ก่อนถึงสร้างได้
- ทดสอบการสร้างซีรีย์พร้อม rating ถูกต้อง
- ทดสอบ validation ของ rating

### 📤 Request: สร้างซีรีย์ (ต้องใช้ Token)

```
Method: POST
URL: {{base_url}}/series
Headers:
  Content-Type: application/json
  Authorization: Bearer {{access_token}}
Body (raw JSON):
```

```json
{
  "title": "Breaking Bad",
  "description": "ซีรีย์เรื่องราวของครูสอนเคมีที่กลายเป็นเจ้าพ่อยาเสพติด เนื้อเรื่องเข้มข้นและตื่นเต้น",
  "year": 2008,
  "reviewText": "ซีรีย์ที่ดีที่สุดเรื่องหนึ่งในประวัติศาสตร์โทรทัศน์ การเล่าเรื่องและการแสดงเยี่ยมยอด",
  "rating": "น 18+",
  "reviewerScore": 10
}
```

### ✅ Expected Response (201 Created):
```json
{
  "id": 1,
  "title": "Breaking Bad",
  "description": "ซีรีย์เรื่องราวของครูสอนเคมีที่กลายเป็นเจ้าพ่อยาเสพติด เนื้อเรื่องเข้มข้นและตื่นเต้น",
  "year": 2008,
  "reviewText": "ซีรีย์ที่ดีที่สุดเรื่องหนึ่งในประวัติศาสตร์โทรทัศน์ การเล่าเรื่องและการแสดงเยี่ยมยอด",
  "rating": "น 18+",
  "reviewerScore": 10,
  "averageScore": 0,
  "reviewCount": 0,
  "userId": 1,
  "createdAt": "2025-10-03T08:05:00.000Z",
  "updatedAt": "2025-10-03T08:05:00.000Z"
}
```

### 📋 สิ่งที่ต้องตรวจสอบ:
- ✅ Status Code = `201 Created`
- ✅ `userId` ตรงกับ User ที่ login
- ✅ `averageScore` = 0 (ยังไม่มีรีวิว)
- ✅ `reviewCount` = 0 (ยังไม่มีรีวิว)
- ✅ `rating` เป็นค่าที่ถูกต้อง

### 💾 บันทึก Series ID:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("series_id", response.id);
    console.log("Series ID saved:", response.id);
}
```

---

### 📤 Request: สร้างซีรีย์เพิ่มเติม

**ซีรีย์ที่ 2:**
```json
{
  "title": "Stranger Things",
  "description": "เรื่องราวลี้ลับในเมืองเล็กๆ ที่เด็กหายตัวไป มีสิ่งเหนือธรรมชาติเข้ามาเกี่ยวข้อง",
  "year": 2016,
  "reviewText": "ซีรีย์แนว sci-fi ที่น่าติดตาม บรรยากาศยุค 80s สุดคลาสสิก",
  "rating": "น 13+",
  "reviewerScore": 9
}
```

**ซีรีย์ที่ 3:**
```json
{
  "title": "พี่มาก..พระโขนง",
  "description": "ซีรีย์ตลกผีไทย เรื่องราวของหนุ่มที่มาอยู่กับแฟนสาวที่เป็นผี",
  "year": 2013,
  "reviewText": "ตลกดีมีเนื้อเรื่อง เหมาะกับครอบครัว",
  "rating": "ท ทั่วไป",
  "reviewerScore": 8
}
```

**ซีรีย์ที่ 4:**
```json
{
  "title": "The Crown",
  "description": "เรื่องราวของราชวงศ์อังกฤษ พระราชินีเอลิซาเบธที่ 2",
  "year": 2016,
  "reviewText": "ซีรีย์ประวัติศาสตร์ที่สวยงามและมีคุณภาพสูง",
  "rating": "น 13+",
  "reviewerScore": 9
}
```

---

### 📤 Request: ทดสอบ Rating ไม่ถูกต้อง (ควรล้มเหลว)

```json
{
  "title": "Test Series",
  "description": "Test",
  "year": 2024,
  "reviewText": "Test",
  "rating": "R-18",
  "reviewerScore": 10
}
```

### ❌ Expected Response (400 Bad Request):
```json
{
  "message": [
    "rating must be one of: ส สงเสริม, ท ทั่วไป, น 13+, น 15+, น 18+, ฉ 20+"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### 📤 Request: ทดสอบสร้างซีรีย์โดยไม่ login (ควรล้มเหลว)

```
Method: POST
URL: {{base_url}}/series
Headers:
  Content-Type: application/json
  (ไม่ใส่ Authorization)
Body: (ซีรีย์อะไรก็ได้)
```

### ❌ Expected Response (401 Unauthorized):
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 4. ทดสอบการดูรายการซีรีย์ (Pagination)

### 🎯 วัตถุประสงค์
- ทดสอบว่าคนทั่วไปดูได้โดยไม่ต้อง login
- ทดสอบ Pagination (default 10 records)
- ทดสอบการแสดง averageScore และ reviewCount

### 📤 Request: ดูซีรีย์ทั้งหมด (ไม่ต้อง login)

```
Method: GET
URL: {{base_url}}/series
Headers: (ไม่ต้องใส่อะไร)
```

### ✅ Expected Response (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "title": "Breaking Bad",
      "description": "ซีรีย์เรื่องราวของครูสอนเคมีที่กลายเป็นเจ้าพ่อยาเสพติด...",
      "year": 2008,
      "reviewText": "ซีรีย์ที่ดีที่สุดเรื่องหนึ่ง...",
      "rating": "น 18+",
      "reviewerScore": 10,
      "averageScore": 0,
      "reviewCount": 0,
      "userId": 1,
      "createdAt": "2025-10-03T08:05:00.000Z",
      "updatedAt": "2025-10-03T08:05:00.000Z"
    },
    {
      "id": 2,
      "title": "Stranger Things",
      ...
    }
  ],
  "total": 4,
  "page": 1,
  "limit": 10
}
```

### 📋 สิ่งที่ต้องตรวจสอบ:
- ✅ Status Code = `200 OK`
- ✅ มี `data` array พร้อมรายการซีรีย์
- ✅ มี `total` (จำนวนทั้งหมด)
- ✅ มี `page` และ `limit`
- ✅ ไม่ต้อง login ก็เรียกได้

---

### 📤 Request: ดูซีรีย์แบบ Pagination (page 1, limit 2)

```
Method: GET
URL: {{base_url}}/series?page=1&limit=2
```

### ✅ Expected Response:
```json
{
  "data": [
    { "id": 1, "title": "Breaking Bad", ... },
    { "id": 2, "title": "Stranger Things", ... }
  ],
  "total": 4,
  "page": 1,
  "limit": 2
}
```

---

### 📤 Request: ดูซีรีย์ page ที่ 2

```
Method: GET
URL: {{base_url}}/series?page=2&limit=2
```

### ✅ Expected Response:
```json
{
  "data": [
    { "id": 3, "title": "พี่มาก..พระโขนง", ... },
    { "id": 4, "title": "The Crown", ... }
  ],
  "total": 4,
  "page": 2,
  "limit": 2
}
```

---

### 📤 Request: ดูซีรีย์เรื่องเดียว (ตาม ID)

```
Method: GET
URL: {{base_url}}/series/{{series_id}}
```

### ✅ Expected Response (200 OK):
```json
{
  "id": 1,
  "title": "Breaking Bad",
  "description": "...",
  "year": 2008,
  "reviewText": "...",
  "rating": "น 18+",
  "reviewerScore": 10,
  "averageScore": 0,
  "reviewCount": 0,
  "userId": 1,
  "createdAt": "2025-10-03T08:05:00.000Z",
  "updatedAt": "2025-10-03T08:05:00.000Z"
}
```

---

## 5. ทดสอบการแก้ไขซีรีย์ (Ownership)

### 🎯 วัตถุประสงค์
- ทดสอบว่า owner แก้ไขซีรีย์ตัวเองได้
- ทดสอบว่าคนอื่นแก้ไขซีรีย์ของ owner ไม่ได้ (Ownership Guard)

### 📤 Request: แก้ไขซีรีย์ (เป็น owner)

```
Method: PATCH
URL: {{base_url}}/series/{{series_id}}
Headers:
  Content-Type: application/json
  Authorization: Bearer {{access_token}}
Body (raw JSON):
```

```json
{
  "reviewText": "อัปเดต: ซีรีย์ที่ดีที่สุดในประวัติศาสตร์โทรทัศน์ ทุกตอนสร้างความตื่นเต้น",
  "reviewerScore": 10
}
```

### ✅ Expected Response (200 OK):
```json
{
  "id": 1,
  "title": "Breaking Bad",
  "description": "...",
  "year": 2008,
  "reviewText": "อัปเดต: ซีรีย์ที่ดีที่สุดในประวัติศาสตร์โทรทัศน์...",
  "rating": "น 18+",
  "reviewerScore": 10,
  "averageScore": 0,
  "reviewCount": 0,
  "userId": 1,
  "createdAt": "2025-10-03T08:05:00.000Z",
  "updatedAt": "2025-10-03T08:10:00.000Z"
}
```

### 📋 สิ่งที่ต้องตรวจสอบ:
- ✅ Status Code = `200 OK`
- ✅ `reviewText` และ `reviewerScore` เปลี่ยนแปลง
- ✅ `updatedAt` เปลี่ยนเป็นเวลาใหม่

---

### 📤 Request: คนอื่นพยายามแก้ไข (ควรล้มเหลว)

**ขั้นตอน:**
1. Login เป็น User 2 (rater1)
```json
POST {{base_url}}/auth/login
{
  "username": "rater1",
  "password": "password456"
}
```

2. บันทึก access_token ของ User 2
```javascript
// ใน Tests tab
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("user2_access_token", response.access_token);
}
```

3. พยายามแก้ไขซีรีย์ของ User 1
```
Method: PATCH
URL: {{base_url}}/series/1
Headers:
  Authorization: Bearer {{user2_access_token}}
Body:
```

```json
{
  "reviewText": "พยายามแก้ไข"
}
```

### ❌ Expected Response (403 Forbidden):
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

---

### 📤 Request: ลบซีรีย์ (เป็น owner)

```
Method: DELETE
URL: {{base_url}}/series/4
Headers:
  Authorization: Bearer {{access_token}}
```

### ✅ Expected Response (200 OK):
```json
{
  "message": "Series deleted successfully"
}
```

---

### 📤 Request: คนอื่นพยายามลบ (ควรล้มเหลว)

```
Method: DELETE
URL: {{base_url}}/series/1
Headers:
  Authorization: Bearer {{user2_access_token}}
```

### ❌ Expected Response (403 Forbidden):
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

---

## 6. ทดสอบการรีวิวซีรีย์

### 🎯 วัตถุประสงค์
- ทดสอบการให้คะแนนรีวิว (ต้อง login)
- ทดสอบว่า averageScore คำนวณถูกต้อง
- ทดสอบว่า reviewCount เพิ่มขึ้น

### 📤 Request: User 2 รีวิวซีรีย์ Breaking Bad (id: 1)

```
Method: POST
URL: {{base_url}}/reviews
Headers:
  Content-Type: application/json
  Authorization: Bearer {{user2_access_token}}
Body (raw JSON):
```

```json
{
  "seriesId": 1,
  "score": 9,
  "comment": "ซีรีย์เยี่ยมมาก! การแสดงของ Bryan Cranston สุดยอด"
}
```

### ✅ Expected Response (201 Created):
```json
{
  "id": 1,
  "score": 9,
  "comment": "ซีรีย์เยี่ยมมาก! การแสดงของ Bryan Cranston สุดยอด",
  "userId": 2,
  "seriesId": 1,
  "createdAt": "2025-10-03T08:15:00.000Z",
  "updatedAt": "2025-10-03T08:15:00.000Z"
}
```

### 📋 สิ่งที่ต้องตรวจสอบ:
- ✅ Status Code = `201 Created`
- ✅ `userId` ตรงกับผู้รีวิว
- ✅ `seriesId` ตรงกับซีรีย์ที่รีวิว

---

### 📤 Request: ตรวจสอบ averageScore และ reviewCount

```
Method: GET
URL: {{base_url}}/series/1
```

### ✅ Expected Response:
```json
{
  "id": 1,
  "title": "Breaking Bad",
  "averageScore": 9,
  "reviewCount": 1,
  ...
}
```

### 📋 สิ่งที่ต้องตรวจสอบ:
- ✅ `averageScore` = 9 (มีรีวิวเดียวให้ 9 คะแนน)
- ✅ `reviewCount` = 1

---

### 📤 Request: สร้าง User ที่ 3 และรีวิวเพิ่ม

**1. สร้าง User 3:**
```json
POST {{base_url}}/users
{
  "username": "rater2",
  "password": "password789"
}
```

**2. Login User 3:**
```json
POST {{base_url}}/auth/login
{
  "username": "rater2",
  "password": "password789"
}
```

**3. User 3 รีวิว Breaking Bad:**
```json
POST {{base_url}}/reviews
Headers: Authorization: Bearer {{user3_access_token}}
{
  "seriesId": 1,
  "score": 10,
  "comment": "เป็นซีรีย์ที่ดีที่สุดที่เคยดู!"
}
```

**4. ตรวจสอบค่าเฉลี่ย:**
```
GET {{base_url}}/series/1
```

### ✅ Expected Response:
```json
{
  "id": 1,
  "averageScore": 9.5,
  "reviewCount": 2,
  ...
}
```

### 📊 การคำนวณ:
- รีวิวที่ 1: 9 คะแนน
- รีวิวที่ 2: 10 คะแนน
- **Average = (9 + 10) / 2 = 9.5** ✅

---

### 📤 Request: ดูรีวิวทั้งหมดของซีรีย์

```
Method: GET
URL: {{base_url}}/series/1/reviews
```

### ✅ Expected Response (200 OK):
```json
[
  {
    "id": 1,
    "score": 9,
    "comment": "ซีรีย์เยี่ยมมาก! การแสดงของ Bryan Cranston สุดยอด",
    "userId": 2,
    "seriesId": 1,
    "createdAt": "2025-10-03T08:15:00.000Z",
    "updatedAt": "2025-10-03T08:15:00.000Z"
  },
  {
    "id": 2,
    "score": 10,
    "comment": "เป็นซีรีย์ที่ดีที่สุดที่เคยดู!",
    "userId": 3,
    "seriesId": 1,
    "createdAt": "2025-10-03T08:20:00.000Z",
    "updatedAt": "2025-10-03T08:20:00.000Z"
  }
]
```

---

### 📤 Request: รีวิวซีรีย์อื่นๆ เพิ่มเติม

**User 2 รีวิว Stranger Things:**
```json
POST {{base_url}}/reviews
Headers: Authorization: Bearer {{user2_access_token}}
{
  "seriesId": 2,
  "score": 8,
  "comment": "สนุกดี แต่บางซีซั่นช้าไปหน่อย"
}
```

**User 3 รีวิว Stranger Things:**
```json
POST {{base_url}}/reviews
Headers: Authorization: Bearer {{user3_access_token}}
{
  "seriesId": 2,
  "score": 9,
  "comment": "ชอบบรรยากาศยุค 80s มาก"
}
```

**ตรวจสอบค่าเฉลี่ย:**
```
GET {{base_url}}/series/2
```

### ✅ Expected:
```json
{
  "id": 2,
  "title": "Stranger Things",
  "averageScore": 8.5,
  "reviewCount": 2,
  ...
}
```

---

### 📤 Request: ทดสอบรีวิวโดยไม่ login (ควรล้มเหลว)

```
Method: POST
URL: {{base_url}}/reviews
Headers: (ไม่ใส่ Authorization)
Body:
```

```json
{
  "seriesId": 1,
  "score": 10,
  "comment": "Test"
}
```

### ❌ Expected Response (401 Unauthorized):
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 7. ทดสอบ Refresh Token

### 🎯 วัตถุประสงค์
- ทดสอบการต่ออายุ Access Token
- ทดสอบว่า Refresh Token ทำงานถูกต้อง

### 📤 Request: Refresh Token

```
Method: POST
URL: {{base_url}}/auth/refresh
Headers:
  Content-Type: application/json
Body (raw JSON):
```

```json
{
  "refresh_token": "{{refresh_token}}"
}
```

### ✅ Expected Response (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 💾 บันทึก Token ใหม่:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.access_token);
    pm.environment.set("refresh_token", response.refresh_token);
    console.log("Tokens refreshed successfully");
}
```

---

## 8. ทดสอบ Keycloak (Bonus)

### 🎯 วัตถุประสงค์
- ทดสอบ SSO Login ผ่าน Keycloak
- ทดสอบการ validate Keycloak token

### 📤 Request: รับ Keycloak Token

```
Method: POST
URL: http://localhost:8080/realms/seely/protocol/openid-connect/token
Headers:
  Content-Type: application/x-www-form-urlencoded
Body (x-www-form-urlencoded):
  grant_type: password
  client_id: seely-api
  client_secret: JRurGjK8s2wdu2RnmOwv6p5NEZXHwSCh
  username: testuser
  password: pass123
```

### ✅ Expected Response (200 OK):
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJf...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJh...",
  "token_type": "Bearer"
}
```

### 💾 บันทึก Keycloak Token:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("keycloak_access_token", response.access_token);
    console.log("Keycloak token saved");
}
```

---

### 📤 Request: ใช้ Keycloak Token เรียก API

```
Method: POST
URL: {{base_url}}/series
Headers:
  Content-Type: application/json
  Authorization: Bearer {{keycloak_access_token}}
Body:
```

```json
{
  "title": "Test with Keycloak",
  "description": "Testing Keycloak authentication",
  "year": 2025,
  "reviewText": "Test",
  "rating": "ท ทั่วไป",
  "reviewerScore": 8
}
```

### ✅ Expected Response (201 Created):
- สร้างซีรีย์สำเร็จด้วย Keycloak token

---

## 📦 Postman Collection

### สร้าง Collection เพื่อทดสอบทั้งหมด

1. เปิด Postman
2. คลิก **Collections** → **+** สร้าง Collection ใหม่
3. ตั้งชื่อ `Seely API - Complete Test Suite`
4. เพิ่ม Folder:
   - `1. User Management`
   - `2. Authentication`
   - `3. Series CRUD`
   - `4. Reviews`
   - `5. Authorization Tests`
   - `6. Keycloak (Bonus)`

5. เพิ่ม Request ตามขั้นตอนข้างบน

---

## ✅ Checklist การทดสอบทั้งหมด

### User Management
- [ ] สร้าง User สำเร็จ
- [ ] Password ถูก encrypt (ไม่แสดงใน response)
- [ ] Validation ทำงาน (username, email, password)

### Authentication
- [ ] Login สำเร็จได้รับ access_token และ refresh_token
- [ ] Login ล้มเหลวเมื่อรหัสผ่านผิด
- [ ] Refresh token ทำงานถูกต้อง

### Series CRUD
- [ ] สร้างซีรีย์ได้ (ต้อง login)
- [ ] Rating validation ทำงาน (6 ค่าที่กำหนด)
- [ ] ดูรายการซีรีย์ได้โดยไม่ต้อง login
- [ ] Pagination ทำงาน (default 10, custom limit)
- [ ] ดูซีรีย์เรื่องเดียวได้
- [ ] แก้ไขซีรีย์ได้ (เฉพาะ owner)
- [ ] ลบซีรีย์ได้ (เฉพาะ owner)

### Authorization (Ownership)
- [ ] Owner แก้ไข/ลบซีรีย์ตัวเองได้
- [ ] คนอื่นแก้ไข/ลบซีรีย์ของ owner ไม่ได้ (403 Forbidden)

### Reviews
- [ ] รีวิวซีรีย์ได้ (ต้อง login)
- [ ] averageScore คำนวณถูกต้อง
- [ ] reviewCount เพิ่มขึ้นถูกต้อง
- [ ] ดูรีวิวทั้งหมดของซีรีย์ได้
- [ ] รีวิวโดยไม่ login ไม่ได้ (401 Unauthorized)

### Keycloak (Bonus)
- [ ] รับ Keycloak token ได้
- [ ] ใช้ Keycloak token เรียก API ได้
- [ ] Keycloak guard ทำงานถูกต้อง

---

## 🚀 Tips การทดสอบ

### 1. ใช้ Pre-request Script
เพิ่มใน Collection level:
```javascript
// Auto-login if token expired
if (!pm.environment.get("access_token")) {
    pm.sendRequest({
        url: pm.environment.get("base_url") + "/auth/login",
        method: "POST",
        header: { "Content-Type": "application/json" },
        body: {
            mode: "raw",
            raw: JSON.stringify({
                username: "reviewer1",
                password: "password123"
            })
        }
    }, (err, res) => {
        if (!err) {
            const data = res.json();
            pm.environment.set("access_token", data.access_token);
        }
    });
}
```

### 2. ใช้ Tests สำหรับ Validation
```javascript
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("Response has access_token", () => {
    pm.expect(pm.response.json()).to.have.property("access_token");
});

pm.test("Response time is less than 500ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

### 3. Export Collection
- คลิก Collection → **...** → **Export**
- เลือก Collection v2.1
- แชร์ไฟล์ให้เพื่อนร่วมทีม

---

## 🎯 สรุป

การทดสอบครอบคลุม:
1. ✅ **User Management** - สร้าง user, validation, password encryption
2. ✅ **Authentication** - JWT login, refresh token
3. ✅ **Series CRUD** - สร้าง, อ่าน, แก้ไข, ลบ
4. ✅ **Authorization** - Ownership guard, JWT guard
5. ✅ **Reviews** - ให้คะแนน, คำนวณค่าเฉลี่ย
6. ✅ **Pagination** - default 10, custom limit
7. ✅ **Validation** - input validation ทุก endpoint
8. ✅ **Keycloak** - SSO integration (bonus)

**ผลลัพธ์ที่คาดหวัง:**
- ทุก endpoint ทำงานถูกต้องตาม spec
- Authorization ทำงาน (เฉพาะ owner แก้ไขได้)
- Validation ป้องกัน invalid input
- Pagination ทำงานถูกต้อง
- คะแนนเฉลี่ยคำนวณถูกต้อง
