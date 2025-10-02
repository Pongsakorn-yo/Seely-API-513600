/**
 * ============================================
 * Review Entity - โครงสร้างตาราง reviews
 * ============================================
 * เก็บข้อมูลรีวิวและคะแนนที่ผู้ใช้ให้กับซีรีส์
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from "typeorm";
import { Series } from "../../series/entities/series.entity";
import { User } from "../../users/entities/user.entity";

/**
 * Review Entity
 * แทนตาราง 'reviews' ใน database
 */
@Entity("reviews")
export class Review {
  /**
   * Primary key - ID ของรีวิว
   * Auto-increment
   */
  @PrimaryGeneratedColumn() id: number;

  /**
   * Foreign key - ID ของซีรีส์ที่ถูกรีวิว
   * เพิ่ม index เพื่อค้นหาเร็วขึ้น
   */
  @Index() @Column() seriesId: number;

  /**
   * Relation กับ Series
   * Many-to-One: หลายรีวิวสามารถอ้างอิงซีรีส์เดียวกัน
   */
  @ManyToOne(() => Series) series: Series;

  /**
   * Foreign key - ID ของผู้รีวิว
   * เพิ่ม index เพื่อค้นหารีวิวของผู้ใช้เร็วขึ้น
   */
  @Index() @Column() reviewerId: number;

  /**
   * Relation กับ User
   * Many-to-One: หลายรีวิวสามารถมีผู้รีวิวคนเดียวกัน
   */
  @ManyToOne(() => User) reviewer: User;

  /**
   * คะแนนที่ผู้รีวิวให้ (1-5)
   * เก็บเป็น float เพื่อรองรับคะแนนทศนิยม
   */
  @Column({ type: "float" }) score: number;

  /**
   * ความคิดเห็น/รีวิวแบบข้อความ
   * Optional - อนุญาตให้เป็น null ได้
   */
  @Column({ type: "text", nullable: true }) comment?: string;

  /**
   * วันที่สร้างรีวิว
   * ตั้งค่าอัตโนมัติเมื่อสร้าง record
   */
  @CreateDateColumn() createdAt: Date;
}
