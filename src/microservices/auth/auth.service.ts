import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/microservices/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dtos/create-user.dto';

const bcrypt = require('bcrypt');

interface UserInterface {
  email: string;
  password: string;
  admin: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(userInterface: CreateUserDto) {
    const result = await bcrypt.hash(userInterface.password, 10);
    const user = this.usersService.create(
      userInterface.email,
      result,
      userInterface.admin,
    );
    return user;
  }

  async signIn(userInterface: CreateUserDto) {
    const [user] = await this.usersService.find(userInterface.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!(await bcrypt.compare(userInterface.password, user.password))) {
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
