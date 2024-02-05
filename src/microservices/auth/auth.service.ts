import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/microservices/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';

const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const result = this.usersService.create(createUserDto);
    if (!result) {
      throw new BadRequestException('User not created');
    }
    return true;
  }

  async signIn(loginUserDto: LoginUserDto) {
    const [user] = await this.usersService.find(loginUserDto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!(await bcrypt.compare(loginUserDto.password, user.password))) {
      throw new BadRequestException('Wrong password');
    }
    const payload = {
      userId: user.userId,
    };
    const token = this.jwtService.sign(payload, {
      secret: process.env.SECRET_KEY,
    });
    return token;
  }
}
