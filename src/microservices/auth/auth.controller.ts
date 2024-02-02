import {
  Body,
  Controller,
  Post,
  Res,
  Response,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/microservices/users/dtos/create-user.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { Response as ResponseType } from 'express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AuthInterceptor } from './auth.interceptor';

@ApiTags('Auth')
@Controller('auth')
@Serialize(UserDto)
@UseInterceptors(AuthInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() body: CreateUserDto) {
    return await this.authService.signUp(body);
  }

  @Post('signin')
  async signIn(@Body() body: CreateUserDto, @Response() res) {
    const token = await this.authService.signIn(body);
    res.cookie('jwt', token, { httpOnly: true });
    return res.status(200).json({ message: 'Login successful' });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: ResponseType) {
    res.cookie('jwt', '', { expires: new Date() });
    return 'Logged out';
  }
}
