import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UsersService } from '../services/users.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAdminGuard } from 'src/guards/jwt-admin.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UserInterceptor } from '../interceptors/users.interceptor';
import { IdDto } from '../dtos/id.dto';
import { ShowDto } from '../dtos/show.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@ApiTags('User')
@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(UserInterceptor)
export class UsersController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private usersService: UsersService,
  ) {}

  @Get('whoami')
  whoAmI(@Request() req): Promise<IdDto> {
    return this.usersService.findOne(parseInt(req.user.userId));
  }

  @Get('all')
  @UseGuards(JwtAdminGuard)
  async findAllUsers(): Promise<ShowDto[]> {
    const value = await this.cacheManager.get('usersAll');
    if (value) {
      return Object(value);
    } else {
      const result = await this.usersService.findAll();
      await this.cacheManager.set('usersAll', result, 10000);
      return result;
    }
  }

  @Get(':id')
  @UseGuards(JwtAdminGuard)
  async findUser(@Param('id') id: string): Promise<IdDto> {
    return this.usersService.findOne(parseInt(id));
  }

  @Put(':id')
  @UseGuards(JwtAdminGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() body: Partial<CreateUserDto>,
  ): Promise<IdDto> {
    return await this.usersService.update(parseInt(id), body);
  }

  @Delete(':id')
  @UseGuards(JwtAdminGuard)
  async removeUser(@Param('id') id: string): Promise<IdDto> {
    return await this.usersService.remove(parseInt(id));
  }
}
