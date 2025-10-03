# 📊 เอกสารสรุปโปรเจค Seely API - ฉบับนำเสนอ

> **API สำหรับแนะนำและรีวิวซีรีส์แบบ Community-driven**  
> ระบบที่ให้ผู้ใช้แนะนำซีรีส์และให้คะแนนได้อย่างมีประสิทธิภาพ

---

## 📑 สารบัญ

1. [ภาพรวมโปรเจค](#-ภาพรวมโปรเจค)
2. [สถาปัตยกรรมระบบ](#-สถาปตยกรรมระบบ)
3. [โครงสร้างฐานข้อมูล](#-โครงสรางฐานขอมล)
4. [Flow Chart การทำงาน](#-flow-chart-การทำงาน)
5. [API Endpoints](#-api-endpoints)
6. [ระบบ Authentication](#-ระบบ-authentication)
7. [ระบบ Authorization](#-ระบบ-authorization)
8. [ฟีเจอร์หลัก](#-ฟเจอรหลก)
9. [เทคโนโลยีที่ใช้](#-เทคโนโลยทใช)
10. [การทดสอบ](#-การทดสอบ)
11. [สถิติโปรเจค](#-สถตโปรเจค)

---

## 🎯 ภาพรวมโปรเจค

### วัตถุประสงค์
สร้าง RESTful API สำหรับระบบแนะนำและรีวิวซีรีส์ที่ให้:
- ผู้แนะนำสามารถสร้างและจัดการซีรีส์ของตนเอง
- ผู้รีวิวสามารถให้คะแนนและแสดงความคิดเห็น
- คนทั่วไปสามารถดูข้อมูลและรีวิวได้โดยไม่ต้อง login

### กลุ่มผู้ใช้งาน
```
┌─────────────────────┐
│  คนทั่วไป (Guest)   │
│  • ดูรายการซีรีย์   │
│  • ค้นหา & กรอง     │
│  • ดูรีวิว          │
└─────────────────────┘

┌─────────────────────┐
│  ผู้ใช้ที่ Login     │
│  • ทำได้ทุกอย่าง    │
│    ของ Guest        │
│  • สร้างซีรีย์       │
│  • รีวิวซีรีย์       │
│  • แก้ไข/ลบของตัวเอง│
└─────────────────────┘

┌─────────────────────┐
│  Admin (อนาคต)      │
│  • จัดการทั้งระบบ   │
│  • ลบข้อมูลใดก็ได้  │
└─────────────────────┘
```

---

## 🏗 สถาปัตยกรรมระบบ

### System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                      Client Layer                          │
│  (Postman, Web Browser, Mobile App, Swagger UI)           │
└────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                       │
│                   (NestJS Application)                     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Middleware Pipeline                     │ │
│  │  → CORS → Validation → Authentication → Guards      │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
                            ↕
┌────────────────────────────────────────────────────────────┐
│                   Controller Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Auth      │  │   Series    │  │   Reviews   │       │
│  │ Controller  │  │ Controller  │  │ Controller  │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└────────────────────────────────────────────────────────────┘
                            ↕
┌────────────────────────────────────────────────────────────┐
│                    Service Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Auth      │  │   Series    │  │   Reviews   │       │
│  │  Service    │  │  Service    │  │  Service    │       │
│  │             │  │             │  │             │       │
│  │ • Login     │  │ • CRUD      │  │ • Create    │       │
│  │ • Register  │  │ • Search    │  │ • List      │       │
│  │ • Validate  │  │ • Filter    │  │ • Stats     │       │
│  │ • Refresh   │  │ • Paginate  │  │ • Calculate │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└────────────────────────────────────────────────────────────┘
                            ↕
┌────────────────────────────────────────────────────────────┐
│                Repository Layer (TypeORM)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │    User     │  │   Series    │  │   Review    │       │
│  │ Repository  │  │ Repository  │  │ Repository  │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└────────────────────────────────────────────────────────────┘
                            ↕ SQL
┌────────────────────────────────────────────────────────────┐
│                  Database Layer                            │
│                  (PostgreSQL 18)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │    users    │  │   series    │  │   reviews   │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└────────────────────────────────────────────────────────────┘
```

### NestJS Module Structure

```
┌─────────────────────────────────────────────────────────┐
│                      AppModule                          │
│                   (Root Module)                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Config, TypeORM, Swagger, ValidationPipe        │ │
│  └───────────────────────────────────────────────────┘ │
│                          │                              │
│         ┌────────────────┼────────────────┐            │
│         ↓                ↓                ↓            │
│  ┌─────────────┐  ┌────────────┐  ┌────────────┐     │
│  │ AuthModule  │  │SeriesModule│  │ReviewModule│     │
│  │             │  │            │  │            │     │
│  │ • Service   │  │ • Service  │  │ • Service  │     │
│  │ • Controller│  │ • Controller│  │ • Controller│    │
│  │ • Strategies│  │ • Entity   │  │ • Entity   │     │
│  │ • Guards    │  │ • DTO      │  │ • DTO      │     │
│  └─────────────┘  └────────────┘  └────────────┘     │
│         │                │                │            │
│         └────────────────┼────────────────┘            │
│                          ↓                              │
│                  ┌─────────────┐                       │
│                  │ UsersModule │                       │
│                  │             │                       │
│                  │ • Service   │                       │
│                  │ • Entity    │                       │
│                  └─────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄 โครงสร้างฐานข้อมูล

### Entity Relationship Diagram (ERD)

```
┌──────────────────────────────────────────────────────────────┐
│                        users                                 │
├──────────────────────────────────────────────────────────────┤
│ 🔑 id            INT (PK, AUTO_INCREMENT)                    │
│ 📧 username      VARCHAR (UNIQUE)                            │
│ 🔒 password      VARCHAR (HASHED)                            │
│ 👤 role          ENUM('USER', 'ADMIN') DEFAULT 'USER'        │
│ 📅 createdAt     TIMESTAMP                                   │
└──────────────────────────────────────────────────────────────┘
              │                          │
              │ owner (1:N)              │ reviewer (1:N)
              ↓                          ↓
┌───────────────────────────┐   ┌──────────────────────────┐
│        series             │   │        reviews           │
├───────────────────────────┤   ├──────────────────────────┤
│ 🔑 id         INT (PK)    │   │ 🔑 id         INT (PK)   │
│ 📺 title      VARCHAR     │←──┤ 🔗 seriesId   INT (FK)   │
│ 📅 year       INT         │   │ 👤 reviewerId INT (FK)   │
│ 📝 reviewDetail TEXT      │   │ ⭐ score      FLOAT(1-5) │
│ 🎯 recommenderScore FLOAT │   │ 💬 comment    TEXT       │
│ 🎭 ratingCode ENUM        │   │ 📅 createdAt  TIMESTAMP  │
│ 👤 ownerId    INT (FK)    │   └──────────────────────────┘
│ 📅 createdAt  TIMESTAMP   │            (N:1)
│ 📅 updatedAt  TIMESTAMP   │
└───────────────────────────┘
```

### Database Relationships

```
User (1) ─────────── (N) Series
   │                      │
   │                      │
   └────────────────┐     │
                    │     │
                    ↓     ↓
User (1) ─────────── (N) Reviews ──── (N:1) Series

Relationships:
✓ User → Series: One-to-Many (owner)
✓ User → Reviews: One-to-Many (reviewer)
✓ Series → Reviews: One-to-Many
✓ Reviews → Series: Many-to-One
✓ Reviews → User: Many-to-One
```

### Rating Code Values

```
┌────────────┬────────────────────────────────────────────────┐
│  Code      │  ความหมาย                                     │
├────────────┼────────────────────────────────────────────────┤
│  ส         │  ส่งเสริม - ควรส่งเสริมให้มีการดู            │
│  ท         │  ทั่วไป - เหมาะกับผู้ดูทั่วไป                │
│  น13+      │  เหมาะสำหรับอายุ 13 ปีขึ้นไป                 │
│  น15+      │  เหมาะสำหรับอายุ 15 ปีขึ้นไป                 │
│  น18+      │  เหมาะสำหรับอายุ 18 ปีขึ้นไป                 │
│  ฉ20+      │  ห้ามผู้มีอายุต่ำกว่า 20 ปีดู                 │
└────────────┴────────────────────────────────────────────────┘
```

---

## 🔄 Flow Chart การทำงาน

### 1. User Registration Flow

```
     START
       ↓
[Client ส่ง POST /auth/register]
  username, password
       ↓
[Validation Pipe] ────→ ❌ Invalid ──→ Return 400 Bad Request
       ↓ ✓ Valid
[Check username ซ้ำ?] ─→ ✓ Yes ──→ Return 409 Conflict
       ↓ ✗ No
[Hash password ด้วย bcrypt]
  (10 salt rounds)
       ↓
[Save to database]
  role = 'USER' (default)
       ↓
[Return user data]
  (ไม่รวม password)
       ↓
      END
```

### 2. Login & JWT Authentication Flow

```
                    START
                      ↓
        [Client ส่ง POST /auth/login]
          username, password
                      ↓
          [Find user by username] ───→ ❌ Not Found ──→ 401 Unauthorized
                      ↓ ✓ Found
          [Compare password with bcrypt] ───→ ❌ Wrong ──→ 401 Unauthorized
                      ↓ ✓ Correct
          ┌───────────────────────────┐
          │   Generate JWT Tokens     │
          ├───────────────────────────┤
          │ Access Token (15 min)     │
          │  payload: {               │
          │    userId, username, role │
          │  }                        │
          │                           │
          │ Refresh Token (7 days)    │
          │  payload: {               │
          │    userId                 │
          │  }                        │
          └───────────────────────────┘
                      ↓
          [Return tokens + user info]
                      ↓
                     END
```

### 3. Protected Request Flow (with JWT)

```
              START
                ↓
[Client ส่ง Request พร้อม Header]
  Authorization: Bearer <token>
                ↓
[JWT Guard] ────────────────────────→ ❌ No Token ──→ 401 Unauthorized
                ↓ ✓ Has Token
[Verify Token Signature] ───────────→ ❌ Invalid ──→ 401 Unauthorized
                ↓ ✓ Valid
[Check Token Expiration] ───────────→ ❌ Expired ──→ 401 Unauthorized
                ↓ ✓ Not Expired
[Extract User Info from Token]
  (userId, username, role)
                ↓
[Attach to Request Object]
  req.user = { id, username, role }
                ↓
[Pass to Controller] ───────────────→ [Business Logic]
                                              ↓
                                      [Return Response]
                                              ↓
                                             END
```

### 4. Series CRUD Flow

#### Create Series Flow
```
                START
                  ↓
[Client ส่ง POST /series + JWT]
  title, year, reviewDetail,
  recommenderScore, ratingCode
                  ↓
[JWT Guard] ──────────→ ❌ Unauthorized ──→ 401
                  ↓ ✓ Authenticated
[Validation] ──────────→ ❌ Invalid ──→ 400 Bad Request
  • title: required
  • year: number
  • recommenderScore: 0-5
  • ratingCode: enum (6 values)
                  ↓ ✓ Valid
[Create Series Entity]
  ownerId = req.user.id
  createdAt = now()
                  ↓
[Save to Database]
                  ↓
[Return Created Series]
  201 Created
                  ↓
                 END
```

#### Get Series with Pagination, Search & Filter Flow
```
                        START
                          ↓
[Client ส่ง GET /series?page=1&limit=10&search=xxx&ratingCode=น18+]
                          ↓
                 [ไม่ต้อง Authentication]
                          ↓
                  [Parse Query Params]
         ┌────────────────┼────────────────┐
         ↓                ↓                ↓
    [Pagination]      [Search]         [Filter]
    • page (default:1) • title like    • ratingCode =
    • limit (default:10, max:50)       
                          ↓
            [Build SQL Query with TypeORM]
              SELECT * FROM series
              WHERE (title LIKE '%xxx%' OR reviewDetail LIKE '%xxx%')
              AND ratingCode = 'น18+'
              LIMIT 10 OFFSET 0
                          ↓
                  [Execute Query]
                          ↓
            [For Each Series: Calculate Stats]
            ┌───────────────────────────┐
            │ SELECT AVG(score)         │
            │ FROM reviews              │
            │ WHERE seriesId = ?        │
            │                           │
            │ SELECT COUNT(*)           │
            │ FROM reviews              │
            │ WHERE seriesId = ?        │
            └───────────────────────────┘
                          ↓
              [Return Paginated Response]
              {
                data: [...],
                total: 100,
                page: 1,
                limit: 10
              }
                          ↓
                         END
```

#### Update Series Flow (with Ownership Guard)
```
                    START
                      ↓
[Client ส่ง PATCH /series/:id + JWT]
  { reviewDetail, recommenderScore }
                      ↓
[JWT Guard] ──────────────→ ❌ No Auth ──→ 401
                      ↓ ✓ Authenticated
[Find Series by ID] ───────→ ❌ Not Found ──→ 404 Not Found
                      ↓ ✓ Found
┌─────────────────────────────────────┐
│      Ownership Guard Check          │
├─────────────────────────────────────┤
│ IF (series.ownerId !== req.user.id) │
│   THEN 403 Forbidden                │
│ ELSE continue                       │
└─────────────────────────────────────┘
                      ↓ ✓ Owner
[Validation] ──────────────→ ❌ Invalid ──→ 400
                      ↓ ✓ Valid
[Update Series]
  updatedAt = now()
                      ↓
[Save to Database]
                      ↓
[Return Updated Series]
  200 OK
                      ↓
                     END
```

#### Delete Series Flow
```
            START
              ↓
[Client ส่ง DELETE /series/:id + JWT]
              ↓
[JWT Guard] ──→ ❌ ──→ 401
              ↓ ✓
[Find Series] ──→ ❌ ──→ 404
              ↓ ✓
[Ownership Guard] ──→ ❌ Not Owner ──→ 403
              ↓ ✓ Owner
[Cascade Delete Related Reviews]
  (TypeORM handles this)
              ↓
[Delete Series]
              ↓
[Return Success]
  200 OK
              ↓
             END
```

### 5. Review System Flow

#### Create Review Flow
```
                        START
                          ↓
[Client ส่ง POST /reviews + JWT]
  { seriesId, score, comment }
                          ↓
[JWT Guard] ──────────────────→ ❌ ──→ 401
                          ↓ ✓
[Validation] ──────────────────→ ❌ ──→ 400
  • seriesId: required, exists
  • score: 1-5 (float)
  • comment: optional, string
                          ↓ ✓
[Check Series Exists] ──────────→ ❌ ──→ 404 Not Found
                          ↓ ✓
[Create Review Entity]
  reviewerId = req.user.id
  createdAt = now()
                          ↓
[Save to Database]
                          ↓
         ┌────────────────────────────┐
         │ Trigger Statistics Update  │
         ├────────────────────────────┤
         │ 1. Calculate Average Score │
         │    AVG(reviews.score)      │
         │                            │
         │ 2. Count Total Reviews     │
         │    COUNT(reviews.id)       │
         │                            │
         │ 3. Update Series Stats     │
         │    (Real-time calculation) │
         └────────────────────────────┘
                          ↓
[Return Created Review + Stats]
  {
    review: {...},
    stats: {
      averageScore: 4.5,
      reviewCount: 10
    }
  }
                          ↓
                         END
```

#### Get Reviews for Series Flow
```
        START
          ↓
[Client ส่ง GET /series/:id/reviews]
          ↓
  [ไม่ต้อง Authentication]
          ↓
[Find Series] ──→ ❌ ──→ 404
          ↓ ✓
[Query Reviews]
  SELECT * FROM reviews
  WHERE seriesId = :id
  ORDER BY createdAt DESC
          ↓
[Include User Info]
  JOIN users ON reviews.reviewerId = users.id
          ↓
[Return Reviews List]
  [
    {
      id, score, comment,
      createdAt,
      reviewer: {
        id, username
      }
    },
    ...
  ]
          ↓
         END
```

### 6. Refresh Token Flow

```
                START
                  ↓
[Client ส่ง POST /auth/refresh]
  { refreshToken }
                  ↓
[Verify Refresh Token] ─────→ ❌ Invalid ──→ 401 Unauthorized
                  ↓ ✓ Valid
[Check Expiration] ──────────→ ❌ Expired ──→ 401 Unauthorized
                  ↓ ✓ Not Expired
[Extract userId from Token]
                  ↓
[Find User in Database] ─────→ ❌ Not Found ──→ 401 Unauthorized
                  ↓ ✓ Found
[Generate New Access Token]
  (15 minutes expiry)
                  ↓
[Generate New Refresh Token]
  (7 days expiry)
                  ↓
[Return New Tokens]
  {
    accessToken: "...",
    refreshToken: "...",
    expiresIn: 900
  }
                  ↓
                 END
```

---

## 🔌 API Endpoints

### 📊 API Summary

```
┌─────────────────────────────────────────────────────────────┐
│                  API Endpoints Overview                     │
├──────────────┬──────────────────────────┬───────────────────┤
│   Method     │   Endpoint               │   Auth Required   │
├──────────────┼──────────────────────────┼───────────────────┤
│   POST       │   /auth/register         │   ✗ Public        │
│   POST       │   /auth/login            │   ✗ Public        │
│   POST       │   /auth/refresh          │   ✗ Public        │
├──────────────┼──────────────────────────┼───────────────────┤
│   GET        │   /series                │   ✗ Public        │
│   GET        │   /series/:id            │   ✗ Public        │
│   POST       │   /series                │   ✓ JWT Required  │
│   PATCH      │   /series/:id            │   ✓ Owner Only    │
│   DELETE     │   /series/:id            │   ✓ Owner Only    │
├──────────────┼──────────────────────────┼───────────────────┤
│   GET        │   /series/:id/reviews    │   ✗ Public        │
│   POST       │   /reviews               │   ✓ JWT Required  │
└──────────────┴──────────────────────────┴───────────────────┘
```

### 🔐 Authentication Endpoints

#### 1. Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

Request Body:
{
  "username": "john_doe",
  "password": "password123"
}

Response: 201 Created
{
  "id": 1,
  "username": "john_doe",
  "role": "USER",
  "createdAt": "2025-10-03T08:00:00.000Z"
}
```

#### 2. Login
```http
POST /api/v1/auth/login
Content-Type: application/json

Request Body:
{
  "username": "john_doe",
  "password": "password123"
}

Response: 200 OK
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "role": "USER"
  }
}
```

#### 3. Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

Request Body:
{
  "refreshToken": "eyJhbGc..."
}

Response: 200 OK
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 900
}
```

### 📺 Series Endpoints

#### 1. Get All Series (Public)
```http
GET /api/v1/series?page=1&limit=10&search=Breaking&ratingCode=น18+

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "title": "Breaking Bad",
      "year": 2008,
      "reviewDetail": "...",
      "ratingCode": "น18+",
      "recommenderScore": 5,
      "ownerId": 1,
      "stats": {
        "averageScore": 4.75,
        "reviewCount": 12
      },
      "createdAt": "2025-10-03T08:00:00.000Z",
      "updatedAt": "2025-10-03T08:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### 2. Get Series by ID (Public)
```http
GET /api/v1/series/1

Response: 200 OK
{
  "id": 1,
  "title": "Breaking Bad",
  "year": 2008,
  "reviewDetail": "...",
  "ratingCode": "น18+",
  "recommenderScore": 5,
  "ownerId": 1,
  "stats": {
    "averageScore": 4.75,
    "reviewCount": 12
  },
  "owner": {
    "id": 1,
    "username": "john_doe"
  },
  "createdAt": "2025-10-03T08:00:00.000Z",
  "updatedAt": "2025-10-03T08:00:00.000Z"
}
```

#### 3. Create Series (Authenticated)
```http
POST /api/v1/series
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "title": "Breaking Bad",
  "year": 2008,
  "reviewDetail": "เรื่องราวของครูเคมี...",
  "ratingCode": "น18+",
  "recommenderScore": 5
}

Response: 201 Created
{
  "id": 1,
  "title": "Breaking Bad",
  "year": 2008,
  "reviewDetail": "เรื่องราวของครูเคมี...",
  "ratingCode": "น18+",
  "recommenderScore": 5,
  "ownerId": 1,
  "createdAt": "2025-10-03T08:00:00.000Z",
  "updatedAt": "2025-10-03T08:00:00.000Z"
}
```

#### 4. Update Series (Owner Only)
```http
PATCH /api/v1/series/1
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "reviewDetail": "Updated review...",
  "recommenderScore": 4.8
}

Response: 200 OK
{
  "id": 1,
  "title": "Breaking Bad",
  "reviewDetail": "Updated review...",
  "recommenderScore": 4.8,
  "updatedAt": "2025-10-03T09:00:00.000Z"
}
```

#### 5. Delete Series (Owner Only)
```http
DELETE /api/v1/series/1
Authorization: Bearer <access_token>

Response: 200 OK
{
  "message": "Series deleted successfully"
}
```

### ⭐ Review Endpoints

#### 1. Get Reviews for Series (Public)
```http
GET /api/v1/series/1/reviews

Response: 200 OK
[
  {
    "id": 1,
    "score": 4.5,
    "comment": "ซีรีย์เยี่ยมมาก!",
    "seriesId": 1,
    "reviewerId": 2,
    "reviewer": {
      "id": 2,
      "username": "jane_doe"
    },
    "createdAt": "2025-10-03T08:30:00.000Z"
  }
]
```

#### 2. Create Review (Authenticated)
```http
POST /api/v1/reviews
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "seriesId": 1,
  "score": 4.5,
  "comment": "ซีรีย์เยี่ยมมาก! แนะนำเลย"
}

Response: 201 Created
{
  "id": 1,
  "seriesId": 1,
  "reviewerId": 2,
  "score": 4.5,
  "comment": "ซีรีย์เยี่ยมมาก! แนะนำเลย",
  "createdAt": "2025-10-03T08:30:00.000Z",
  "stats": {
    "averageScore": 4.5,
    "reviewCount": 1
  }
}
```

---

## 🔐 ระบบ Authentication

### JWT Token Structure

#### Access Token (อายุ 15 นาที)
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": 1,
    "username": "john_doe",
    "role": "USER",
    "iat": 1696320000,
    "exp": 1696320900
  },
  "signature": "..."
}
```

#### Refresh Token (อายุ 7 วัน)
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": 1,
    "iat": 1696320000,
    "exp": 1696924800
  },
  "signature": "..."
}
```

### Password Security

```
┌─────────────────────────────────────────────────────────┐
│              Password Hashing with bcrypt               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Plain Password: "password123"                         │
│         ↓                                               │
│  bcrypt.hash(password, 10)                             │
│         ↓                                               │
│  Hashed: "$2b$10$xyz...abc" (60 characters)            │
│                                                         │
│  Verification:                                          │
│    bcrypt.compare(inputPassword, hashedPassword)       │
│         ↓                                               │
│    true/false                                           │
│                                                         │
│  Security Features:                                     │
│  ✓ Salt rounds: 10                                     │
│  ✓ One-way hashing (ถอดรหัสไม่ได้)                     │
│  ✓ Rainbow table resistant                             │
│  ✓ Timing attack resistant                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🛡 ระบบ Authorization

### Authorization Layers

```
┌──────────────────────────────────────────────────────────┐
│                 Authorization Pyramid                    │
│                                                          │
│                      ┌──────────┐                        │
│                      │  Admin   │                        │
│                      │ (Future) │                        │
│                      └──────────┘                        │
│                    /              \                      │
│              ┌──────────────────────┐                    │
│              │   Resource Owner     │                    │
│              │  (Ownership Guard)   │                    │
│              │ • Update own series  │                    │
│              │ • Delete own series  │                    │
│              └──────────────────────┘                    │
│            /                          \                  │
│      ┌────────────────────────────────────┐              │
│      │      Authenticated User            │              │
│      │         (JWT Guard)                │              │
│      │  • Create series                   │              │
│      │  • Create reviews                  │              │
│      └────────────────────────────────────┘              │
│    /                                        \            │
│  ┌────────────────────────────────────────────┐          │
│  │            Public Access                   │          │
│  │         (No Authentication)                │          │
│  │  • View series list                        │          │
│  │  • View series details                     │          │
│  │  • View reviews                            │          │
│  │  • Search & Filter                         │          │
│  └────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────┘
```

### Ownership Guard Implementation

```typescript
┌─────────────────────────────────────────────────────┐
│            Ownership Guard Logic                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  @UseGuards(JwtAuthGuard, OwnershipGuard)         │
│  async updateSeries(                               │
│    @Param('id') id: number,                       │
│    @Request() req                                  │
│  ) {                                               │
│                                                     │
│    1. JWT Guard validates token                   │
│       ↓                                            │
│    2. Find resource (series) by ID                │
│       ↓                                            │
│    3. Compare resource.ownerId with req.user.id   │
│       ↓                                            │
│    IF (resource.ownerId !== req.user.id)          │
│       THEN throw ForbiddenException               │
│       ELSE allow operation                        │
│  }                                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Guard Execution Order

```
Request → JWT Guard → Ownership Guard → Controller
             ↓            ↓                 ↓
          Validate    Check Owner       Execute
           Token      Permission        Business
                                        Logic
```

---

## 🚀 ฟีเจอร์หลัก

### 1. Search & Filter System

```
┌─────────────────────────────────────────────────────────┐
│              Search & Filter Architecture               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Query Parameters:                                      │
│  ?search=Breaking&ratingCode=น18+&page=1&limit=10      │
│                                                         │
│         ↓                    ↓              ↓           │
│    [Search Term]      [Rating Filter]   [Pagination]   │
│         ↓                    ↓              ↓           │
│  ┌──────────────────────────────────────────────────┐  │
│  │         SQL Query Builder (TypeORM)              │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                  │  │
│  │  SELECT * FROM series                            │  │
│  │  WHERE (                                         │  │
│  │    title ILIKE '%Breaking%'                      │  │
│  │    OR reviewDetail ILIKE '%Breaking%'            │  │
│  │  )                                               │  │
│  │  AND ratingCode = 'น18+'                         │  │
│  │  ORDER BY createdAt DESC                         │  │
│  │  LIMIT 10 OFFSET 0                               │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│         ↓                                               │
│    [Results + Stats]                                    │
│         ↓                                               │
│    {                                                    │
│      data: [...],                                       │
│      total: 25,                                         │
│      page: 1,                                           │
│      limit: 10,                                         │
│      totalPages: 3                                      │
│    }                                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2. Review Statistics Calculation

```
┌──────────────────────────────────────────────────────────┐
│        Real-time Statistics Calculation System           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Trigger: GET /series/:id                                │
│                                                          │
│  Step 1: Fetch Series Data                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ SELECT * FROM series WHERE id = :id                │ │
│  └────────────────────────────────────────────────────┘ │
│                      ↓                                   │
│  Step 2: Calculate Average Score                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │ SELECT AVG(score) as averageScore                  │ │
│  │ FROM reviews                                       │ │
│  │ WHERE seriesId = :id                               │ │
│  │                                                    │ │
│  │ Example: (9 + 10 + 8 + 9.5) / 4 = 9.125           │ │
│  └────────────────────────────────────────────────────┘ │
│                      ↓                                   │
│  Step 3: Count Total Reviews                            │
│  ┌────────────────────────────────────────────────────┐ │
│  │ SELECT COUNT(*) as reviewCount                     │ │
│  │ FROM reviews                                       │ │
│  │ WHERE seriesId = :id                               │ │
│  │                                                    │ │
│  │ Example: 4 reviews                                 │ │
│  └────────────────────────────────────────────────────┘ │
│                      ↓                                   │
│  Step 4: Merge Results                                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │ {                                                  │ │
│  │   id: 1,                                           │ │
│  │   title: "Breaking Bad",                           │ │
│  │   ...seriesData,                                   │ │
│  │   stats: {                                         │ │
│  │     averageScore: 9.125,  // จาก Step 2           │ │
│  │     reviewCount: 4         // จาก Step 3           │ │
│  │   }                                                │ │
│  │ }                                                  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Performance Optimization:                               │
│  ✓ Database indexes on seriesId                         │
│  ✓ Query results cached (optional)                      │
│  ✓ Efficient SQL aggregation                            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 3. Pagination System

```
┌─────────────────────────────────────────────────────┐
│           Pagination Implementation                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Parameters:                                        │
│  • page: current page number (default: 1)          │
│  • limit: items per page (default: 10, max: 50)    │
│                                                     │
│  Calculation:                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ skip = (page - 1) × limit                    │  │
│  │ take = limit                                 │  │
│  │                                              │  │
│  │ Example: page=2, limit=10                    │  │
│  │   skip = (2-1) × 10 = 10                     │  │
│  │   take = 10                                  │  │
│  │                                              │  │
│  │ SQL: LIMIT 10 OFFSET 10                      │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  Response Format:                                   │
│  {                                                  │
│    "data": [...],        // items for current page │
│    "total": 45,          // total items            │
│    "page": 2,            // current page           │
│    "limit": 10,          // items per page         │
│    "totalPages": 5,      // ceil(45 / 10)          │
│    "hasNextPage": true,  // page < totalPages      │
│    "hasPrevPage": true   // page > 1               │
│  }                                                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 เทคโนโลยีที่ใช้

### Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Backend Stack                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Framework & Runtime:                                   │
│  ✓ NestJS v10.3.0    - Progressive Node.js framework   │
│  ✓ Node.js v18+      - JavaScript runtime              │
│  ✓ TypeScript v5.4   - Type-safe development           │
│                                                         │
│  Database & ORM:                                        │
│  ✓ PostgreSQL 18     - Relational database             │
│  ✓ TypeORM v0.3.20   - Object-Relational Mapping       │
│  ✓ pg v8.11          - PostgreSQL client               │
│                                                         │
│  Authentication & Security:                             │
│  ✓ JWT (@nestjs/jwt) - JSON Web Tokens                 │
│  ✓ Passport v0.7     - Authentication middleware       │
│  ✓ passport-jwt v4   - JWT strategy                    │
│  ✓ bcrypt v5.1       - Password hashing                │
│                                                         │
│  Validation & Documentation:                            │
│  ✓ Zod v3.23         - Schema validation               │
│  ✓ nestjs-zod v3     - NestJS integration              │
│  ✓ class-validator   - DTO validation                  │
│  ✓ class-transformer - Object transformation           │
│  ✓ Swagger/OpenAPI   - API documentation               │
│                                                         │
│  Bonus Features:                                        │
│  ✓ Keycloak v26.1    - SSO & OAuth2/OIDC               │
│                                                         │
│  Testing:                                               │
│  ✓ Jest v29          - Unit & E2E testing              │
│  ✓ Supertest v6      - HTTP assertions                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Dependencies Overview

```json
{
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/config": "^3.2.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/swagger": "^7.3.1",
    "@nestjs/typeorm": "^10.0.0",
    "bcrypt": "^5.1.1",
    "passport-jwt": "^4.0.1",
    "pg": "^8.11.3",
    "typeorm": "^0.3.20",
    "zod": "^3.23.8"
  }
}
```

---

## 🧪 การทดสอบ

### Test Coverage

```
┌──────────────────────────────────────────────────────────┐
│                  Test Coverage Summary                   │
├────────────────┬─────────────────────────────────────────┤
│  Test Type     │  Coverage                               │
├────────────────┼─────────────────────────────────────────┤
│  Unit Tests    │  23 tests (100% pass)                   │
│                │  • AuthService: 10 tests                │
│                │  • SeriesService: 8 tests               │
│                │  • ReviewsService: 5 tests              │
│                │                                         │
│  E2E Tests     │  8 tests (100% pass)                    │
│                │  • Complete user flows                  │
│                │  • Authentication & Authorization       │
│                │  • CRUD operations                      │
│                │  • Pagination & Stats                   │
│                │                                         │
│  Coverage      │  Service Layer: >90%                    │
│                │  • auth.service.ts: 100%                │
│                │  • series.service.ts: 92.85%            │
│                │  • reviews.service.ts: 100%             │
└────────────────┴─────────────────────────────────────────┘
```

### Test Structure

```
test/
├── unit/
│   ├── auth.service.spec.ts       # JWT, bcrypt, validation
│   ├── series.service.spec.ts     # CRUD, search, filter
│   └── reviews.service.spec.ts    # Review logic, stats
│
└── e2e/
    └── app.e2e-spec.ts            # Integration tests
        ├── User Registration
        ├── Login & JWT
        ├── Series CRUD
        ├── Ownership Guard
        ├── Reviews
        └── Statistics
```

### Running Tests

```bash
# Unit Tests
npm run test

# Unit Tests (watch mode)
npm run test:watch

# E2E Tests
npm run test:e2e

# Coverage Report
npm run test:cov
```

---

## 📈 สถิติโปรเจค

### Project Metrics

```
┌──────────────────────────────────────────────────────────┐
│                   Project Statistics                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Code Base:                                              │
│  • Total Files: 50+                                      │
│  • TypeScript Files: 35+                                 │
│  • Lines of Code: ~3,000+                                │
│  • Test Files: 12                                        │
│                                                          │
│  API Endpoints:                                          │
│  • Total Endpoints: 10                                   │
│  • Public Endpoints: 5                                   │
│  • Protected Endpoints: 5                                │
│                                                          │
│  Database:                                               │
│  • Tables: 3 (users, series, reviews)                    │
│  • Relationships: 4                                      │
│  • Indexes: 5+                                           │
│                                                          │
│  Features:                                               │
│  • Authentication: JWT + Refresh Token                   │
│  • Authorization: Role-based + Ownership                 │
│  • Search: Full-text search                              │
│  • Filter: Rating code filtering                         │
│  • Pagination: Configurable (max 50/page)                │
│  • Statistics: Real-time calculation                     │
│                                                          │
│  Documentation:                                          │
│  • README.md                                             │
│  • TESTING_GUIDE.md                                      │
│  • DATABASE_SETUP.md                                     │
│  • KEYCLOAK_USAGE_GUIDE.md                               │
│  • Swagger UI at /api                                    │
│  • Postman Collection                                    │
│                                                          │
│  Testing:                                                │
│  • Unit Tests: 23                                        │
│  • E2E Tests: 8                                          │
│  • Coverage: >90%                                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Development Timeline

```
Phase 1: Setup & Database (Week 1)
├─ Project initialization
├─ Database schema design
├─ TypeORM configuration
└─ Basic CRUD operations

Phase 2: Authentication (Week 2)
├─ User entity & service
├─ JWT implementation
├─ Refresh token mechanism
└─ Password encryption

Phase 3: Business Logic (Week 3)
├─ Series management
├─ Review system
├─ Search & filter
└─ Pagination

Phase 4: Authorization (Week 4)
├─ Role-based access
├─ Ownership guard
└─ API security

Phase 5: Testing & Documentation (Week 5)
├─ Unit tests
├─ E2E tests
├─ Swagger documentation
└─ Postman collection

Bonus: Keycloak Integration (Week 6)
├─ SSO setup
├─ OAuth2/OIDC
└─ Integration testing
```

---

## 🎓 Key Learning Points

### Technical Skills Demonstrated

```
1. Backend Development
   ✓ RESTful API design
   ✓ Clean architecture
   ✓ Dependency injection
   ✓ Error handling

2. Database Management
   ✓ Relational database design
   ✓ ORM usage (TypeORM)
   ✓ Query optimization
   ✓ Indexing strategies

3. Security
   ✓ JWT authentication
   ✓ Password hashing (bcrypt)
   ✓ Authorization guards
   ✓ CORS configuration

4. Testing
   ✓ Unit testing
   ✓ Integration testing
   ✓ Test-driven development
   ✓ Code coverage

5. Documentation
   ✓ API documentation (Swagger)
   ✓ README files
   ✓ Code comments
   ✓ Testing guides
```

---

## 🚀 Future Enhancements

### Roadmap

```
Phase 1 (Current): ✅ Complete
├─ User authentication
├─ Series management
├─ Review system
└─ Basic features

Phase 2 (Next):
├─ User profiles
├─ Series images/posters
├─ Advanced search (tags, genres)
└─ Rating system improvements

Phase 3 (Future):
├─ Social features (follow users)
├─ Watchlist functionality
├─ Notifications
└─ Email verification

Phase 4 (Advanced):
├─ Recommendation engine
├─ Analytics dashboard
├─ API rate limiting
└─ Caching (Redis)

Phase 5 (Scale):
├─ Microservices architecture
├─ Message queue (RabbitMQ)
├─ Load balancing
└─ Horizontal scaling
```

---

## 📞 Contact & Support

```
┌─────────────────────────────────────────────────────┐
│               Project Information                   │
├─────────────────────────────────────────────────────┤
│  Project Name: Seely API                            │
│  Version: 0.1.0                                     │
│  License: MIT                                       │
│                                                     │
│  Documentation:                                     │
│  • README.md                                        │
│  • Swagger UI: http://localhost:3000/api            │
│                                                     │
│  Repository:                                        │
│  • GitHub: Seely-API-513600                         │
│                                                     │
│  Tech Stack:                                        │
│  • NestJS + TypeScript                              │
│  • PostgreSQL + TypeORM                             │
│  • JWT + bcrypt                                     │
│  • Swagger + Postman                                │
└─────────────────────────────────────────────────────┘
```

---

## 📝 Conclusion

### Project Summary

**Seely API** เป็นระบบ RESTful API ที่ออกแบบมาอย่างดีสำหรับการแนะนำและรีวิวซีรีส์ โดยมีจุดเด่นดังนี้:

✅ **Architecture**: Clean architecture ด้วย NestJS, แยก layers ชัดเจน  
✅ **Security**: JWT authentication, bcrypt hashing, ownership guard  
✅ **Database**: PostgreSQL with proper indexing และ relationships  
✅ **Features**: CRUD, search, filter, pagination, real-time statistics  
✅ **Testing**: 31 tests with >90% coverage  
✅ **Documentation**: Comprehensive docs + Swagger UI + Postman collection  
✅ **Bonus**: Keycloak SSO integration  

### Key Achievements

1. **Complete REST API** ที่ตอบโจทย์ทุก requirement
2. **Secure** ด้วย JWT และ bcrypt
3. **Scalable** architecture พร้อมขยายต่อ
4. **Well-tested** ด้วย unit และ E2E tests
5. **Well-documented** สำหรับ maintainability

---

**Developed with ❤️ for Series Lovers Community**

