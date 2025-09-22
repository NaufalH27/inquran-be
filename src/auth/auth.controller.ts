// auth.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create.user';
import { RefreshTokenDto } from './dto/refresh-token';
import { LoginUserDto } from './dto/login.user';
import { ApiKeyGuard } from 'src/guards/api-key.guard';

@Controller('auth')
@UseGuards(ApiKeyGuard)
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body: LoginUserDto) {
        return this.authService.login(body);
    }

    @Post('register')
    async register(@Body() body: CreateUserDto) {
        return this.authService.register(body);
    }

    @Post('refresh-token')
    async refreshToken(@Body() body: RefreshTokenDto) {
        return this.authService.refreshToken(body.sessionId, body.refreshToken);
    }

    @Post('logout')
    async logout(@Body('sessionId') sessionId: string) {
    return this.authService.logout(sessionId);
    }

}
