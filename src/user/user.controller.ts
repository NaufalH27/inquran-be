import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseUserDto } from './dto/response.user';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}  // ✅ inject service
    @Get(':id')
    @UseInterceptors(ClassSerializerInterceptor)
    async findOne(@Param('id') id: string): Promise<ResponseUserDto> {
    const user = await this.userService.findById(+id);

    if (!user) {
        throw new NotFoundException('User not found');
    }

    return new ResponseUserDto(user);
    }
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  async findMe(@GetUser('userId') userId: number): Promise<ResponseUserDto> {
    const user = await this.userService.findById(userId); 

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new ResponseUserDto(user);
  }


}

