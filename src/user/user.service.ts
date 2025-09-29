import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { user } from 'generated/prisma';
import { ResponseUserDto } from './dto/response.user';
import { CreateGoogleUserDto, CreateUserDto } from 'src/auth/dto/create.user';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update.user';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async findById(id: number): Promise<user> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error("User Tidak Ditemukan");
    }

    user.photo_url = user.photo_url == null ? null : `${process.env.BASE_UPLOAD_URL}/uploads/photos/${user.photo_url}`;
    return user;
  }
  async updateFullname(userId: number, fullName: string){
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return new ResponseUserDto(await this.prisma.user.update({
      where: { id: userId },
      data: { full_name : fullName ?? user.full_name },
    }));
  }

  async updateUserInfo(userId: number, userInfo: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (userInfo.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: userInfo.username },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Username sudah digunakan'); 
      }
    }

    if (userInfo.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: userInfo.email },
      });

      if (existingEmail && existingEmail.id !== userId) {
        throw new ConflictException('Email sudah digunakan'); 
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: userInfo.username,
        full_name: userInfo.fullName,
        email: userInfo.email,
      },
    });

    return new ResponseUserDto(updatedUser);
  }


  async updatePhoto(userId: number, photoFileName: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return new ResponseUserDto(await this.prisma.user.update({
      where: { id: userId },
      data: {
        photo_url: photoFileName, 
      },
    }));
  }
  async bindGoogleOauthMethod(userId: number, google: CreateGoogleUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return new ResponseUserDto(await this.prisma.user.update({
      where: { id: userId },
      data: {
        google_id : google.googleId,
        google_email : google.email
      },
    }));
  }
  async bindPasswordMethod(userId: number, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const hashed = await this.hashString(password);
    return new ResponseUserDto(await this.prisma.user.update({
      where: { id: userId },
      data: {
        password : hashed
      },
    }));
  }

  async hashString(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }
}
