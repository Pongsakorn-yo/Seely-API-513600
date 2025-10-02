# 🎬 Seely API

> **API สำหรับแนะนำและรีวิวซีรีส์** - ระบบ Community-driven ที่ให้ผู้ใช้แนะนำซีรีส์และให้คะแนนได้

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## � สารบัญ
- [คุณสมบัติหลัก](#-คุณสมบัติหลัก)
- [เทคโนโลยีที่ใช้](#-เทคโนโลยีที่ใช้)
- [การติดตั้ง](#-การติดตั้ง)
- [การใช้งาน API](#-การใช้งาน-api)
- [โครงสร้างโปรเจค](#-โครงสร้างโปรเจค)
- [ฐานข้อมูล](#-ฐานข้อมูล)
- [การพัฒนา](#-การพัฒนา)

---

## ✨ คุณสมบัติหลัก

### 🔐 Authentication & Authorization
- ✅ **JWT Authentication** - ระบบ login/register พร้อม Access Token และ Refresh Token
- ✅ **Password Encryption** - เข้ารหัส password ด้วย bcrypt (10 rounds)
- ✅ **Role-based Access** - แยก User และ Admin
- ✅ **Ownership Guard** - เจ้าของเท่านั้นที่แก้ไข/ลบข้อมูลของตัวเองได้

### 📺 Series Management
- ✅ **CRUD Operations** - สร้าง, อ่าน, แก้ไข, ลบซีรีส์
- ✅ **Search & Filter** - ค้นหาจากชื่อ/รายละเอียด และกรองตาม Rating Code
- ✅ **Pagination** - รองรับการแบ่งหน้า (default: 10 รายการ/หน้า, max: 50)
- ✅ **Average Score** - คำนวณคะแนนเฉลี่ยจากรีวิวทั้งหมดอัตโนมัติ
- ✅ **Rating Code** - ระบุเรทติ้ง (ส, ท, น13+, น15+, น18+, ฉ20+)

### ⭐ Review System
- ✅ **User Reviews** - ผู้ใช้ที่ login แล้วสามารถรีวิวและให้คะแนนได้ (1-5)
- ✅ **Comments** - เพิ่มความคิดเห็นแบบข้อความ (optional)
- ✅ **Public Access** - ทุกคนดูรีวิวได้โดยไม่ต้อง login
- ✅ **Statistics** - แสดงคะแนนเฉลี่ยและจำนวนรีวิวทั้งหมด

### 📚 Documentation
- ✅ **Swagger UI** - API Documentation แบบ Interactive ที่ `/api`
- ✅ **Example Values** - ตัวอย่างข้อมูลสำหรับทุก endpoint
- ✅ **Schema Validation** - แสดง validation rules ชัดเจน

---

## 🛠 เทคโนโลยีที่ใช้

### Backend Framework
- **NestJS** v10.3.0 - Progressive Node.js framework
- **TypeScript** - Type-safe development

### Database & ORM
- **PostgreSQL** 18 - Relational database
- **TypeORM** - ORM with automatic synchronization (dev mode)

### Authentication
- **Passport JWT** - JWT strategy
- **bcrypt** - Password hashing

### Validation
- **Zod** - Schema validation
- **nestjs-zod** - NestJS integration

### Documentation
- **Swagger / OpenAPI** - API documentation

---

## 🚀 การติดตั้ง

### ข้อกำหนดของระบบ
- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm หรือ yarn

### 1️⃣ Clone โปรเจค
```bash
git clone <repository-url>
cd Seely-API-513600
```

### 2️⃣ ติดตั้ง Dependencies
```bash
npm install
```

### 3️⃣ ตั้งค่า Database

#### สร้าง PostgreSQL Database
```bash
# เข้า PostgreSQL shell
psql -U postgres

# สร้าง database
CREATE DATABASE seely_db;

# ออกจาก shell
\q
```

**หรือใช้ GUI Tools เช่น:**
- TablePlus
- pgAdmin
- DBeaver

📖 **อ่านรายละเอียดเพิ่มเติม:** [DATABASE_SETUP.md](./DATABASE_SETUP.md)

### 4️⃣ ตั้งค่า Environment Variables

สร้างไฟล์ `.env` (คัดลอกจาก `.env.example`):
```bash
cp .env.example .env
```

แก้ไขค่าใน `.env`:
```env
# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/seely_db

# JWT Secrets
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-too

# Server
PORT=3000
NODE_ENV=development
```

### 5️⃣ รันโปรเจค
```bash
# Development mode (auto-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

✅ **เมื่อรันครั้งแรก** TypeORM จะสร้าง tables ใน database อัตโนมัติ!

### 6️⃣ เข้าถึง Application
- 🚀 **API Server:** http://localhost:3000
- 📚 **Swagger UI:** http://localhost:3000/api

---

## � การใช้งาน API

### Base URL
```
http://localhost:3000/api/v1
```

### 🔐 Authentication Endpoints

#### 1. Register (สมัครสมาชิก)
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "role": "USER"
}
```

#### 2. Login (เข้าสู่ระบบ)
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15m"
}
```

#### 3. Refresh Token (ต่ออายุ token)
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token-here"
}
```

---

### 📺 Series Endpoints

#### 1. Get All Series (ดูรายการซีรีส์ทั้งหมด) - Public
```http
GET /api/v1/series?page=1&limit=10&search=Breaking&ratingCode=น18+
```

**Query Parameters:**
- `page` (optional) - หน้าที่ต้องการ (default: 1)
- `limit` (optional) - จำนวนต่อหน้า (default: 10, max: 50)
- `search` (optional) - ค้นหาจากชื่อหรือรายละเอียด
- `ratingCode` (optional) - กรองตาม rating (ส, ท, น13+, น15+, น18+, ฉ20+)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Breaking Bad",
      "year": 2008,
      "reviewDetail": "เรื่องราวของครูเคมี...",
      "recommenderScore": 5,
      "ratingCode": "น18+",
      "owner": {
        "id": 1,
        "username": "john_doe"
      },
      "stats": {
        "averageScore": 4.75,
        "reviewCount": 12
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "itemCount": 25,
    "pageCount": 3,
    "hasNextPage": true
  }
}
```

#### 2. Get Series by ID (ดูซีรีส์เดียว) - Public
```http
GET /api/v1/series/1
```

#### 3. Create Series (สร้างซีรีส์ใหม่) - Authenticated
```http
POST /api/v1/series
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "Breaking Bad",
  "year": 2008,
  "reviewDetail": "เรื่องราวของครูเคมีที่กลายเป็นเจ้าพ่อยาเสพติด",
  "recommenderScore": 5,
  "ratingCode": "น18+"
}
```

#### 4. Update Series (แก้ไขซีรีส์) - Owner Only
```http
PATCH /api/v1/series/1
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "recommenderScore": 4.8,
  "reviewDetail": "อัปเดตรีวิวใหม่..."
}
```

#### 5. Delete Series (ลบซีรีส์) - Owner Only
```http
DELETE /api/v1/series/1
Authorization: Bearer <access-token>
```

---

### ⭐ Review Endpoints

#### 1. Get Reviews by Series (ดูรีวิวของซีรีส์) - Public
```http
GET /api/v1/series/1/reviews?page=1&limit=10
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "score": 4.5,
      "comment": "ซีรีส์ดีมาก! น่าติดตามมาก",
      "createdAt": "2025-10-02T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "itemCount": 5,
    "pageCount": 1,
    "hasNextPage": false
  }
}
```

#### 2. Create Review (สร้างรีวิว) - Authenticated
```http
POST /api/v1/reviews
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "seriesId": 1,
  "score": 4.5,
  "comment": "ซีรีส์ดีมาก! แนะนำเลยครับ"
}
```

**Response:**
```json
{
  "id": 1,
  "seriesId": 1,
  "reviewerId": 2,
  "score": 4.5,
  "comment": "ซีรีส์ดีมาก! แนะนำเลยครับ",
  "createdAt": "2025-10-02T12:00:00Z",
  "stats": {
    "averageScore": 4.25,
    "reviewCount": 3
  }
}
```

---

## 📁 โครงสร้างโปรเจค

```
Seely-API-513600/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── data-source.ts             # Database configuration
│   │
│   ├── auth/                      # Authentication module
│   │   ├── auth.controller.ts     # Auth endpoints
│   │   ├── auth.service.ts        # Auth business logic
│   │   ├── auth.module.ts         # Auth module config
│   │   └── strategies/            # Passport strategies
│   │       ├── jwt.strategy.ts    # Access token validation
│   │       └── refresh.strategy.ts # Refresh token validation
│   │
│   ├── users/                     # Users module
│   │   ├── users.service.ts       # User CRUD operations
│   │   ├── users.module.ts        # Users module config
│   │   └── entities/
│   │       └── user.entity.ts     # User database schema
│   │
│   ├── series/                    # Series module
│   │   ├── series.controller.ts   # Series endpoints
│   │   ├── series.service.ts      # Series business logic
│   │   ├── series.module.ts       # Series module config
│   │   ├── dto.ts                 # Data Transfer Objects
│   │   └── entities/
│   │       └── series.entity.ts   # Series database schema
│   │
│   ├── reviews/                   # Reviews module
│   │   ├── reviews.controller.ts  # Reviews endpoints
│   │   ├── reviews.service.ts     # Reviews business logic
│   │   ├── reviews.module.ts      # Reviews module config
│   │   ├── dto.ts                 # Data Transfer Objects
│   │   └── entities/
│   │       └── review.entity.ts   # Review database schema
│   │
│   └── common/                    # Shared resources
│       └── guards/
│           └── ownership.guard.ts # Ownership verification
│
├── test/                          # E2E tests
├── .env.example                   # Environment template
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── nest-cli.json                  # NestJS CLI config
└── README.md                      # Documentation
```

---

## 🗄 ฐานข้อมูล

### Entity Relationship Diagram

```
┌─────────────┐
│    Users    │
├─────────────┤
│ id (PK)     │───┐
│ username    │   │
│ password    │   │ Owner
│ role        │   │
└─────────────┘   │
                  │
                  ↓
            ┌─────────────┐
            │   Series    │
            ├─────────────┤
            │ id (PK)     │───┐
            │ title       │   │
            │ year        │   │
            │ reviewDetail│   │ Series
            │ recommScore │   │
            │ ratingCode  │   │
            │ ownerId (FK)│   │
            └─────────────┘   │
                  ↑           │
                  │           ↓
         Reviewer │     ┌─────────────┐
                  │     │   Reviews   │
                  │     ├─────────────┤
                  └─────│ id (PK)     │
                        │ seriesId(FK)│
                        │ reviewerId  │
                        │ score       │
                        │ comment     │
                        │ createdAt   │
                        └─────────────┘
```

### Tables

#### 📄 users
- `id` - Primary Key (auto-increment)
- `username` - Unique, ชื่อผู้ใช้
- `password` - Hashed password (bcrypt)
- `role` - USER | ADMIN

#### 📺 series
- `id` - Primary Key (auto-increment)
- `title` - ชื่อซีรีส์
- `year` - ปีที่ออกอากาศ
- `reviewDetail` - รายละเอียด/รีวิว (text)
- `recommenderScore` - คะแนนจากผู้แนะนำ (0-5)
- `ratingCode` - เรทติ้ง (ส, ท, น13+, น15+, น18+, ฉ20+)
- `ownerId` - Foreign Key → users.id

#### ⭐ reviews
- `id` - Primary Key (auto-increment)
- `seriesId` - Foreign Key → series.id
- `reviewerId` - Foreign Key → users.id
- `score` - คะแนน (1-5)
- `comment` - ความคิดเห็น (optional)
- `createdAt` - วันที่สร้าง (auto-timestamp)

---

## 🔧 การพัฒนา

### Available Scripts

```bash
# Development
npm run start:dev      # รันโหมด development (auto-reload)

# Production
npm run build          # Build project
npm run start:prod     # รันโหมด production

# Testing
npm run test           # รัน unit tests
npm run test:e2e       # รัน E2E tests
npm run test:cov       # รัน tests พร้อม coverage

# Linting
npm run lint           # ตรวจสอบ code style
npm run format         # จัดรูปแบบ code
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret key สำหรับ access token | - |
| `JWT_REFRESH_SECRET` | Secret key สำหรับ refresh token | - |
| `PORT` | Port ที่เซิร์ฟเวอร์จะรัน | 3000 |
| `NODE_ENV` | Environment (development/production) | development |

### Code Style
- ใช้ **TypeScript** strict mode
- ใช้ **ESLint** และ **Prettier** สำหรับ code formatting
- Comment ภาษาไทยอธิบายทุกฟังก์ชันและคลาส

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Developed with ❤️ for Seely Community

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - The progressive Node.js framework
- [TypeORM](https://typeorm.io/) - Amazing ORM for TypeScript
- [PostgreSQL](https://www.postgresql.org/) - The world's most advanced open source database

## 🧪 ทดสอบ API

### วิธีที่ 1: ใช้ Postman Collection
นำเข้าไฟล์ `postman_collection.json` เพื่อทดสอบทุก endpoints

### วิธีที่ 2: ใช้ PowerShell Script (แนะนำ!)

มีสคริปต์อัตโนมัติ `scripts/sample-requests.ps1` สำหรับทดสอบ flow ทั้งหมด:
- สมัครสมาชิก
- ล็อกอิน
- สร้างซีรีส์
- รีวิวซีรีส์
- ดูรายการซีรีส์

**วิธีใช้:**

1. รันเซิร์ฟเวอร์:
```bash
npm run start:dev
```

2. เปิด PowerShell ใหม่แล้วรันสคริปต์:
```powershell
pwsh ./scripts/sample-requests.ps1
```
*หมายเหตุ: ถ้าใช้ Windows PowerShell 5.1 ให้รัน `powershell` แทน `pwsh`*

**ตัวอย่างผลลัพธ์:**
```json
{
  "username": "demo-20251001112313",
  "password": "Password123!",
  "login": {
    "accessToken": "...",
    "refreshToken": "..."
  },
  "createdSeries": {
    "id": 1,
    "title": "Demo Series 20251001112313",
    "ratingCode": "น13+",
    "recommenderScore": 4.2
  },
  "review": {
    "score": 4.5,
    "stats": {
      "averageScore": 4.5,
      "reviewCount": 1
    }
  }
}
```

**พารามิเตอร์เพิ่มเติม:**
- `-BaseUrl` - เปลี่ยน API URL (default: `http://localhost:3000/api/v1`)
- `-UsernamePrefix` - เปลี่ยนพรีฟิกซ์ username
- `-Password` - กำหนดรหัสผ่านเอง (SecureString)

## 🗂️ โครงสร้างโปรเจค

```
src/
├── auth/              # Authentication & Authorization
│   ├── strategies/    # JWT & Refresh Token strategies
│   └── guards/        # Auth guards
├── common/            # Shared resources
│   └── guards/        # Ownership guard
├── users/             # User management
│   └── entities/      # User entity
├── series/            # Series CRUD
│   ├── entities/      # Series entity
│   ├── dto.ts         # Data transfer objects
│   └── ...
├── reviews/           # Review system
│   ├── entities/      # Review entity
│   ├── dto.ts         # Data transfer objects
│   └── ...
├── data-source.ts     # TypeORM configuration
└── main.ts            # Application entry point
```

## 🎯 Business Requirements

### ผู้แนะนำซีรีย์
- ✅ Login ได้
- ✅ สร้างและแก้ไขการแนะนำซีรีย์ (CRUD)
- ✅ แก้ไข/ลบเฉพาะซีรีย์ของตัวเอง

### ผู้ให้คะแนน
- ✅ Login ได้
- ✅ ให้คะแนนซีรีย์ได้ (1-5 คะแนน)
- ✅ เขียน comment ประกอบได้

### คนทั่วไป
- ✅ ดูรายการซีรีย์ได้ (ไม่ต้อง login)
- ✅ เห็นคะแนนรีวิวเฉลี่ยและจำนวนผู้รีวิว
- ✅ Pagination (default 10 records)

## 🎭 Rating Codes

| Code | ความหมาย |
|------|----------|
| ส | ส่งเสริม - ควรส่งเสริมให้มีการดู |
| ท | ทั่วไป - เหมาะกับผู้ดูทั่วไป |
| น13+ | เหมาะสำหรับอายุ 13 ปีขึ้นไป |
| น15+ | เหมาะสำหรับอายุ 15 ปีขึ้นไป |
| น18+ | เหมาะสำหรับอายุ 18 ปีขึ้นไป |
| ฉ20+ | ห้ามผู้มีอายุต่ำกว่า 20 ปีดู |

## 🛠️ คำสั่งที่มีประโยชน์

```bash
# Development
npm run start:dev

# Build
npm run build

# Production
npm run start

# Run tests
npm run test

# E2E tests
npm run test:e2e

# Format code
npm run format

# Lint
npm run lint
```

## 📊 ดูและจัดการ Database

ใช้ **TablePlus** เพื่อ:
- ✅ ดูข้อมูลใน tables
- ✅ รัน SQL queries
- ✅ Export/Import ข้อมูล
- ✅ ดู relationships ระหว่าง tables

ดูคำแนะนำที่: [DATABASE_SETUP.md](./DATABASE_SETUP.md)

## 🔧 Troubleshooting

### Database Connection Error
1. ตรวจสอบว่า PostgreSQL กำลังรัน
2. ตรวจสอบ `DATABASE_URL` ใน `.env`
3. ลองเชื่อมต่อด้วย TablePlus เพื่อยืนยัน

### Port Already in Use
```bash
# เปลี่ยน port ใน .env
PORT=3001
```

### การ Debug
- เปิด SQL logging ใน `src/data-source.ts` (ตั้งค่า `logging: true` แล้ว)
- ดู console logs เพื่อเห็น SQL queries ที่ถูก execute

## 📝 License

MIT
