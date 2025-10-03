/**
 * ============================================
 * Series Entity - โครงสร้างตาราง series
 * ============================================
 * เก็บข้อมูลซีรีส์ที่ผู้ใช้แนะนำ
 * รวมถึงชื่อ, ปี, รีวิว, คะแนน, rating
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

/**
 * Type สำหรับ Rating Code
 */
export type RatingCode = "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+";

/**
 * Series Entity
 * แทนตาราง 'series' ใน database
 */
@Entity("series")
export class Series {
  /**
   * Primary key - ID ของซีรีส์
   * Auto-increment
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * ชื่อซีรีส์
   */
  @Column()
  title: string;

  /**
   * ปีที่ออกฉาย
   */
  @Column({ type: "int" })
  year: number;

  /**
   * รายละเอียด/รีวิวจากผู้แนะนำ
   * เก็บเป็น text เพื่อรองรับข้อความยาว
   */
  @Column({ type: "text" })
  reviewDetail: string;

  /**
   * คะแนนที่ผู้แนะนำให้ (0-5)
   */
  @Column({ type: "float" })
  recommenderScore: number;

  /**
   * Rating code (ส, ท, น13+, น15+, น18+, ฉ 20+)
   * กำหนดกลุ่มอายุที่เหมาะสม
   */
  @Column({ type: "varchar", length: 4 })
  ratingCode: RatingCode;

  /**
   * Relation กับ User (เจ้าของ)
   * Many-to-One: หลายซีรีส์สามารถมีเจ้าของคนเดียว
   */
  @ManyToOne(() => User)
  owner: User;

  /**
   * Foreign key - ID ของเจ้าของ
   * เพิ่ม index เพื่อค้นหาเร็วขึ้น
   */
  @Index()
  @Column()
  ownerId: number;

  /**
   * วันเวลาที่สร้างซีรีย์
   * บันทึกอัตโนมัติเมื่อสร้าง record ใหม่
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * วันเวลาที่แก้ไขล่าสุด
   * อัปเดตอัตโนมัติทุกครั้งที่มีการแก้ไข
   */
  @UpdateDateColumn()
  updatedAt: Date;
}
