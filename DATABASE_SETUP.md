# การตั้งค่า PostgreSQL Database สำหรับ Seely API

## เตรียมความพร้อม

### 1. ติดตั้ง PostgreSQL
ดาวน์โหลดและติดตั้ง PostgreSQL จาก: https://www.postgresql.org/download/windows/

**สิ่งที่ต้องจำระหว่างการติดตั้ง:**
- Username: `postgres` (default)
- Password: ตั้งรหัสผ่านที่จำได้ (เช่น `postgres`)
- Port: `5432` (default)

### 2. ติดตั้ง TablePlus
ดาวน์โหลดและติดตั้ง TablePlus จาก: https://tableplus.com/

---

## สร้าง Database ด้วย TablePlus

### ขั้นตอนที่ 1: เชื่อมต่อ PostgreSQL Server

1. เปิด **TablePlus**
2. คลิก **"Create a new connection"**
3. เลือก **PostgreSQL**
4. กรอกข้อมูลการเชื่อมต่อ:
   ```
   Name: Seely API (หรือชื่อที่คุณต้องการ)
   Host: localhost
   Port: 5432
   User: postgres
   Password: postgres
   Database: postgres (เชื่อมต่อ default database ก่อน)
   ```
5. คลิก **"Test"** เพื่อทดสอบการเชื่อมต่อ
6. คลิก **"Connect"**

### ขั้นตอนที่ 2: สร้าง Database

1. หลังจากเชื่อมต่อสำเร็จ คลิกขวาที่ **"Databases"** ในแถบด้านซ้าย
2. เลือก **"Create Database..."**
3. กรอกชื่อ Database: `seely_db`
4. คลิก **"Create"**

**หรือใช้ SQL Command:**
```sql
CREATE DATABASE seely_db;
```

### ขั้นตอนที่ 3: เชื่อมต่อ Database ใหม่

1. สร้าง connection ใหม่ใน TablePlus
2. กรอกข้อมูล:
   ```
   Name: Seely API - Database
   Host: localhost
   Port: 5432
   User: postgres
   Password: postgres
   Database: seely_db
   ```
3. คลิก **"Connect"**

---

## ตั้งค่าโปรเจค Seely API

### 1. อัพเดทไฟล์ .env

แก้ไขไฟล์ `.env` ให้ตรงกับข้อมูลการเชื่อมต่อของคุณ:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/seely_db
```

**รูปแบบ:** `postgresql://[username]:[password]@[host]:[port]/[database]`

เปลี่ยน `postgres:postgres` เป็น username และ password ที่คุณตั้งไว้

### 2. ติดตั้ง Dependencies

```powershell
npm install
```

### 3. รันโปรเจค

```powershell
npm run start:dev
```

เมื่อรันครั้งแรก TypeORM จะสร้าง tables อัตโนมัติจากที่เรากำหนดไว้ใน entities:
- `users` - เก็บข้อมูลผู้ใช้
- `series` - เก็บข้อมูลซีรีย์
- `reviews` - เก็บข้อมูลรีวิว

### 4. ตรวจสอบ Tables ใน TablePlus

กลับไปที่ TablePlus และ refresh connection จะเห็น tables ใหม่ที่ถูกสร้างขึ้น

---

## โครงสร้าง Database Schema

### Table: users
```sql
- id: SERIAL PRIMARY KEY
- username: VARCHAR UNIQUE NOT NULL
- password: VARCHAR NOT NULL (encrypted with bcrypt)
- role: VARCHAR(10) DEFAULT 'USER'
```

### Table: series
```sql
- id: SERIAL PRIMARY KEY
- title: VARCHAR NOT NULL
- year: INTEGER NOT NULL
- reviewDetail: TEXT NOT NULL
- recommenderScore: FLOAT NOT NULL
- ratingCode: VARCHAR(4) NOT NULL
- ownerId: INTEGER NOT NULL (FK -> users.id)
```

### Table: reviews
```sql
- id: SERIAL PRIMARY KEY
- seriesId: INTEGER NOT NULL (FK -> series.id)
- reviewerId: INTEGER NOT NULL (FK -> users.id)
- score: FLOAT NOT NULL (1-5)
- comment: TEXT NULLABLE
- createdAt: TIMESTAMP DEFAULT NOW()
```

---

## คำสั่ง SQL ที่เป็นประโยชน์

### ดูข้อมูลทั้งหมด
```sql
SELECT * FROM users;
SELECT * FROM series;
SELECT * FROM reviews;
```

### ดูซีรีย์พร้อมคะแนนเฉลี่ย
```sql
SELECT 
  s.*,
  COUNT(r.id) as review_count,
  AVG(r.score) as average_score
FROM series s
LEFT JOIN reviews r ON s.id = r."seriesId"
GROUP BY s.id;
```

### ลบข้อมูลทั้งหมด (ระวัง!)
```sql
TRUNCATE TABLE reviews CASCADE;
TRUNCATE TABLE series CASCADE;
TRUNCATE TABLE users CASCADE;
```

---

## การแก้ไขปัญหา

### ❌ Connection refused
- ตรวจสอบว่า PostgreSQL service กำลังรัน
- Windows: เปิด Services และหา "postgresql-x64-[version]"

### ❌ Authentication failed
- ตรวจสอบ username และ password ใน `.env`
- ลองเชื่อมต่อด้วย TablePlus เพื่อยืนยันข้อมูล

### ❌ Database does not exist
- ต้องสร้าง database `seely_db` ใน TablePlus ก่อน

### ❌ Port 5432 already in use
- มี PostgreSQL หรือ service อื่นใช้ port นี้อยู่
- เปลี่ยน port ใน `.env` และ connection settings

---

## การใช้งานต่อ

หลังจากตั้งค่าเสร็จแล้ว คุณสามารถ:

1. ✅ ใช้ Postman ทดสอบ API endpoints
2. ✅ ดูและแก้ไขข้อมูลผ่าน TablePlus
3. ✅ ตรวจสอบ SQL queries ที่ TypeORM generate ผ่าน console logs
4. ✅ Backup/Restore database ผ่าน TablePlus

---

## Tips

- 🔍 เปิด logging ใน `data-source.ts` เพื่อดู SQL queries
- 💾 ใช้ TablePlus ใน export ข้อมูลเป็น CSV/JSON
- 🔐 อย่าลืมเปลี่ยน JWT secrets ใน `.env` สำหรับ production
- 📊 ใช้ TablePlus ในการดู relationships ระหว่าง tables

