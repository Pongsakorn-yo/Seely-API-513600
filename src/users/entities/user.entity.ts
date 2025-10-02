/**
 * ============================================
 * User Entity - โครงสร้างตาราง users
 * ============================================
 * กำหนดโครงสร้างของตาราง users ใน database
 * เก็บข้อมูลผู้ใช้งาน username, password (hash), role
 */

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

/**
 * Enum สำหรับกำหนดสิทธิ์ผู้ใช้
 * - USER: ผู้ใช้ทั่วไป (สามารถรีวิว, ดูซีรีส์)
 * - ADMIN: ผู้ดูแลระบบ (สิทธิ์พิเศษ)
 */
export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

/**
 * User Entity
 * แทนตาราง 'users' ใน database
 */
@Entity("users")
export class User {
  /**
   * Primary key - ID ของผู้ใช้
   * Auto-increment (เพิ่มอัตโนมัติ)
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Username - ชื่อผู้ใช้สำหรับเข้าสู่ระบบ
   * ต้องไม่ซ้ำกัน (unique: true)
   */
  @Column({ unique: true })
  username: string;

  /**
   * Password - รหัสผ่านที่ถูก hash ด้วย bcrypt
   * ⚠️ ไม่ควร return ค่านี้ใน API response
   */
  @Column()
  password: string;

  /**
   * Role - สิทธิ์การใช้งาน
   * ค่าเริ่มต้น: USER
   */
  @Column({ type: "varchar", length: 10, default: Role.USER })
  role: Role;
}
