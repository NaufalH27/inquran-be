import {
  Controller,
  Get,
  Body,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  NotFoundException,
  UseGuards,
  Patch,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseUserDto } from './dto/response.user';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { UpdateFullnameDto } from './dto/update.user';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}  
  @Get('profile/me')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  async findMe(@GetUser('userId') userId: number): Promise<ResponseUserDto> {
    const user = await this.userService.findById(userId); 

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new ResponseUserDto(user);
  }
  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id') id: string): Promise<ResponseUserDto> {
  const user = await this.userService.findById(+id);

  if (!user) {
      throw new NotFoundException('User not found');
  }

  return new ResponseUserDto(user);
  }

  @Patch('profile/me/fullname')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(
    @GetUser('userId') userId: number,
    @Body() dto: UpdateFullnameDto,
  ) {
    return this.userService.updateFullname(userId, dto.fullName);
  }

  @Patch('profile/me/photo')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR, 
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, 
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          const allowedExts = allowedTypes
            .map((type) => '.' + type.split('/').pop()) 
            .join(', ')
            .replace('.svg+xml', '.svg'); 
          return cb(
            new BadRequestException(
              `Tipe file tidak diizinkan. Hanya diperbolehkan: ${allowedExts}`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @GetUser('userId') userId: number,
  ) {
    return this.userService.updatePhoto(userId, file.filename); 
  }
}


