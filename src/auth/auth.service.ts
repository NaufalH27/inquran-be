import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateGoogleUserDto, CreateUserDto } from './dto/create.user';
import { LoginUserDto } from './dto/login.user';
import { user } from 'generated/prisma';
import { randomBytes } from 'crypto';
import { ResponseUserDto } from 'src/user/dto/response.user';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (user) {
      if (!user.password) {
        throw new UnauthorizedException('Password Login belum di set up');
      } 
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

    let user: user | null = null;

    if (loginType === 'email') {
      user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) throw new UnauthorizedException('Email tidak ditemukan');
    } else {
      user = await this.prisma.user.findUnique({ where: { username } });
      if (!user) throw new UnauthorizedException('Username tidak ditemukan');
    }

    if (!user.password) {
      throw new UnauthorizedException('Password login belum di set up');
    }

    const passwordValid = await this.compareBcrypt(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Password salah');
    }

    const tokens = await this.generateTokens(user);

    return {
      tokens,
      user: new ResponseUserDto(user),
    };
  }


  async register(userForm: CreateUserDto) {
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: userForm.username },
    });
    if (existingUsername) throw new ConflictException('Username sudah digunakan');

    const existingEmail = await this.prisma.user.findUnique({
      where: { email: userForm.email },
    });
    if (existingEmail) throw new ConflictException('Email sudah digunakan');

    const hashed = await this.hashString(userForm.password);
    const user = await this.prisma.user.create({
      data: {
        username: userForm.username,
        password: hashed,
        email: userForm.email,
      },
    });

    const tokens = await this.generateTokens(user);

    return {
      tokens,
      user: new ResponseUserDto(user),
    };
  }

  async registerGoogle(dto: CreateGoogleUserDto) {
    let user = await this.prisma.user.findUnique({
      where: { google_id: dto.googleId },
    });

    let isNewUser = false;

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          full_name: dto.fullName,
          google_id: dto.googleId,
          google_email: dto.email,
        },
      });
      isNewUser = true;
    }

    const tokens = await this.generateTokens(user);

    return {
      isNewUser, 
      tokens,
      user: new ResponseUserDto(user),
    };
  }

  async refreshToken(sessionId: string, refreshToken: string) {
    const storedToken = await this.prisma.refreshtoken.findUnique({
      where: { id: sessionId },
    });

    if (!storedToken || storedToken.expired_at < new Date()) {
      throw new UnauthorizedException('Refresh token tidak valid atau sudah kedaluwarsa');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: storedToken.user_id },
    });
    if (!user) throw new UnauthorizedException('Pengguna tidak ditemukan');

    const isTokenValid = await this.compareBcrypt(refreshToken, storedToken.token);
    if (!isTokenValid) {
      throw new UnauthorizedException('Refresh token tidak valid atau sudah kedaluwarsa');
    }

    await this.prisma.refreshtoken.delete({ where: { id: storedToken.id } });

    const tokens = await this.generateTokens(user);

    return {
      tokens,
      user: new ResponseUserDto(user),
    };
  }


  async logout(sessionId: string) {
    await this.prisma.refreshtoken.deleteMany({
      where: { id: sessionId },
    });
    return { status: 'OK', message: 'Berhasil logout' };
  }

  async generateTokens(user: user) {
    const rawRefreshToken = randomBytes(64).toString('hex');
    const hashRefToken = await this.hashString(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    const refToken = await this.prisma.refreshtoken.create({
      data: {
        token: hashRefToken,
        user_id: user.id,
        expired_at: expiresAt,
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
