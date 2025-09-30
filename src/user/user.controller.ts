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
  Put,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseUserDto } from './dto/response.user';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';
import { diskStorage } from 'multer';
import { ChangePasswordDto, UpdateUserDto } from './dto/update.user';
import { CreateGoogleUserDto, CreateUserDto } from 'src/auth/dto/create.user';
import { UpdateFullnameDto } from './dto/update.user';
import { favorite } from 'generated/prisma';
import { FavoriteDto } from './dto/favorite.user';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }
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


  @Patch('profile/me/fullname')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(
    @GetUser('userId') userId: number,
    @Body() dto: UpdateFullnameDto,
  ) {
    return await this.userService.updateFullname(userId, dto.fullName);
  }

  @Patch('profile/me/photo')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: join(process.env.UPLOAD_DIR || '', 'uploads', 'photos'),
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
    return await this.userService.updatePhoto(userId, file.filename); 
  }

  @Put('profile/me')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  async updateMe(@GetUser('userId') userId: number, @Body() body: UpdateUserDto): Promise<ResponseUserDto> {
    return await this.userService.updateUserInfo(userId, body); 
  }

  @Put('password/change')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  async changePassword(@GetUser('userId') userId: number, @Body() body: ChangePasswordDto): Promise<ResponseUserDto> {
    return await this.userService.changePassword(userId, body); 
  }

  @Put('bind/password')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  async bindPasswordMethod(@GetUser('userId') userId: number, @Body() userForm: CreateUserDto): Promise<ResponseUserDto> {
    return await this.userService.bindPasswordMethod(userId, userForm); 
  }

  @Put('bind/oauth/google')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  async bindGoogleMethod(@GetUser('userId') userId: number, @Body() body: CreateGoogleUserDto): Promise<ResponseUserDto> {
    return await this.userService.bindGoogleOauthMethod(userId, body); 
  }

  @Post('favorite/add')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  async addFavorites(
    @GetUser('userId') userId: number,
    @Body() favorite: FavoriteDto ,
  ) {
      return await this.userService.addFavorite(userId, favorite.surah_number, favorite.ayah_number);
  }

  @Post('favorite/delete')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  async deleteFavorites(
    @GetUser('userId') userId: number,
    @Body() favorite: FavoriteDto ,
  ) {
      return await this.userService.deleteFavorite(userId, favorite.surah_number, favorite.ayah_number );
  }

  @Get('favorites')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  async listFavorites(
    @GetUser('userId') userId: number,
  ) {
    return await this.userService.listFavorites(userId);
  }
}


