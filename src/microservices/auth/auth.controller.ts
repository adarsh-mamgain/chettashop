import {
  Body,
  Controller,
  Post,
  Response,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/microservices/users/dtos/create-user.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AuthInterceptor } from './auth.interceptor';
import { LoginUserDto } from './dtos/login-user.dto';

type responseReturn = { message: string };

@ApiTags('Auth')
@Controller('auth')
@Serialize(UserDto)
@UseInterceptors(AuthInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body() body: CreateUserDto,
    @Response() res,
  ): Promise<responseReturn> {
    const result = await this.authService.signUp(body);
    return res.status(201).json({ message: 'User created' });
  }

  @Post('signin')
  async signIn(
    @Body() body: LoginUserDto,
    @Response() res,
  ): Promise<responseReturn> {
    const token = await this.authService.signIn(body);
    res.cookie('jwt', token, { httpOnly: true });
    return res.status(200).json({ message: 'Login successful' });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Response({ passthrough: true }) res): Promise<responseReturn> {
    res.cookie('jwt', '', { expires: new Date() });
    return res.status(200).json({ message: 'Logged out' });
  }
}
