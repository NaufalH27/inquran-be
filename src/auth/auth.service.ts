import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create.user';
import { LoginUserDto } from './dto/login.user';
import { User } from 'generated/prisma';
import { randomBytes } from 'crypto';

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (user) {
      const passwordValid = await this.compareBcrypt(password, user.password);
      if (passwordValid) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(loginDto: LoginUserDto) {
    const { loginType, username, email, password } = loginDto;

    let user: User | null = null;

    if (loginType === 'email') {
      user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new UnauthorizedException('Email tidak ditemukan');
      }
    } else {
      user = await this.prisma.user.findUnique({ where: { username } });
      if (!user) {
        throw new UnauthorizedException('Username tidak ditemukan');
      }
    }

    const passwordValid = await this.compareBcrypt(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Password salah');
    }

    return this.generateTokens(user);
  }

  async register(userForm: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: userForm.username }, { email: userForm.email }],
      },
    });

    if (existingUser) {
      throw new BadRequestException('Username atau email sudah digunakan');
    }

    const hashed = await this.hashString(userForm.password);
    const user = await this.prisma.user.create({
      data: {
        username: userForm.username,
        password: hashed,
        email: userForm.email,
      },
    });

    return this.generateTokens(user);
  }

  async refreshToken(sessionId: string, refreshToken: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { id: sessionId },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token tidak valid atau sudah kedaluwarsa');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: storedToken.userId },
    });

    if (!user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan');
    }

    const isTokenValid = await this.compareBcrypt(refreshToken, storedToken.token);
    if (!isTokenValid) {
      throw new UnauthorizedException('Refresh token tidak valid atau sudah kedaluwarsa');
    }

    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    return this.generateTokens(user);
  }

  async logout(sessionId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { id: sessionId },
    });
    return { status: 'OK', message: 'Berhasil logout' };
  }

  async generateTokens(user: User) {
    const rawRefreshToken = randomBytes(64).toString('hex');
    const hashRefToken = await this.hashString(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    const refToken = await this.prisma.refreshToken.create({
      data: {
        token: hashRefToken,
        userId: user.id,
        expiresAt,
      },
    });

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      sessionId: refToken.id,
    };
  }

  async compareBcrypt(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  async hashString(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }
}
