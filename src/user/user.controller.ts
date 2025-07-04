import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseUserDto } from './dto/response.user';

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

}
