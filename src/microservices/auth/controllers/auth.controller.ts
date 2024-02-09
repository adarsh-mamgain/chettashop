import {
  Body,
  Controller,
  Post,
  Response,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/microservices/users/dtos/create-user.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from '../dtos/user.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { LoginUserDto } from '../dtos/login-user.dto';
import { CustomThrottlerGuard } from 'src/guards/customThrottler.guard';

@ApiTags('Auth')
@Controller('auth')
@Serialize(UserDto)
@UseInterceptors(AuthInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(CustomThrottlerGuard)
  @Post('signup')
  async signUp(@Body() body: CreateUserDto, @Response() res) {
    const token = await this.authService.signUp(body);
    return res.status(201).json(token);
  }

  @UseGuards(CustomThrottlerGuard)
  @Post('signin')
  async signIn(@Body() body: LoginUserDto, @Response() res) {
    const token = await this.authService.signIn(body);
    return res.status(200).json(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Response() res) {
    return res.status(200).json({ message: 'Logged out' });
  }
}
