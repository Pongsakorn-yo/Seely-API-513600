/**
 * ============================================
 * Users Service - Service จัดการผู้ใช้งาน
 * ============================================
 * จัดการ CRUD operations สำหรับ User entity
 * - สร้างผู้ใช้ใหม่
 * - ค้นหาผู้ใช้ตาม ID หรือ username
 */

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role, User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    // Inject User Repository สำหรับเข้าถึง database
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  /**
   * สร้างผู้ใช้ใหม่ในระบบ
   * @param data - ข้อมูลผู้ใช้ { username, password, role? }
   * @returns User object ที่สร้างเสร็จแล้ว
   */
  async create(data: { username: string; password: string; role?: Role }) {
    // สร้าง instance ของ User entity
    const u = this.repo.create(data);

    // บันทึกลง database
    return this.repo.save(u);
  }

  /**
   * ค้นหาผู้ใช้จาก ID
   * @param id - User ID
   * @returns User object หรือ null ถ้าไม่พบ
   */
  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * ค้นหาผู้ใช้จาก username
   * @param username - ชื่อผู้ใช้
   * @returns User object หรือ null ถ้าไม่พบ
   */
  async findByUsername(username: string) {
    return this.repo.findOne({ where: { username } });
  }
}
