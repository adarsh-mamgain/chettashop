import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAdminGuard } from 'src/guards/jwt-admin.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UserInterceptor } from './users.interceptor';
import { IdDto } from './dtos/id.dto';
import { ShowDto } from './dtos/show.dto';

@ApiTags('User')
@Controller('users')
@UseGuards(JwtAuthGuard)
@Serialize(UserDto)
@UseInterceptors(UserInterceptor)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('whoami')
  whoAmI(@Request() req): Promise<UserDto> {
    return this.usersService.findOne(req.user.userId);
  }

  @Get('all')
  @UseGuards(JwtAdminGuard)
  findAllUsers(): Promise<ShowDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAdminGuard)
  async findUser(@Param('id') id: string): Promise<IdDto> {
    return await this.usersService.findOne(parseInt(id));
  }

  @Put(':id')
  @UseGuards(JwtAdminGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() body: CreateUserDto,
  ): Promise<IdDto> {
    return await this.usersService.update(parseInt(id), body);
  }

  @Delete(':id')
  @UseGuards(JwtAdminGuard)
  async removeUser(@Param('id') id: string): Promise<IdDto> {
    return await this.usersService.remove(parseInt(id));
  }
}
