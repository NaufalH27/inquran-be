import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { user } from 'generated/prisma';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async findById(id: number): Promise<user> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error("User Tidak Ditemukan");
    }
    return user;
  }
  async updateFullname(userId: number, fullName: string){
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    this.prisma.user.update({
      where: { id: userId },
      data: { full_name : fullName ?? user.full_name },
    });
    return {
      status: 'success',
      code: 200,
      message: 'OK',
    };
  }

  async updatePhoto(userId: number, photoFileName: string): Promise<user> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        photo_url: photoFileName, 
      },
    });
  }
}
