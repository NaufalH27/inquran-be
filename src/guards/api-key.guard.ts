// src/guards/api-key.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const env = this.configService.get<string>('NODE_ENV');
    const apiKey = this.configService.get<string>('API_KEY');

    if (env === 'development') {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const clientKey = request.headers['x-api-key'];

    if (!clientKey || clientKey !== apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
