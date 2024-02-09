import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../../auth/dtos/create-user.dto';

const bcrypt = require('bcrypt');

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.repo
      .createQueryBuilder()
      .insert()
      .values(createUserDto)
      .returning('*')
      .execute();

    return user.raw[0];
  }

  findOne(userId: number) {
    return this.repo
      .createQueryBuilder('user')
      .where('user.userId = :userId', { userId })
      .getOne();
  }

  find(email: string) {
    return this.repo.find({ where: { email } });
  }

  async findAll() {
    const result = await this.repo.createQueryBuilder().getMany();
    return result.map((user) => {
      this.userModifier(user, 'all');
      return user;
    });
  }

  async update(id: number, attrs: Partial<User>) {
    attrs.password = await bcrypt.hash(attrs.password, 10);

    const result = await this.repo
      .createQueryBuilder()
      .update()
      .set(attrs)
      .where('userId = :id', { id })
      .returning('*')
      .execute();

    return this.userModifier(result.raw[0]);
  }

  async remove(id: number) {
    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .where('userId = :id', { id })
      .returning('*')
      .execute();

    return this.userModifier(result.raw[0]);
  }

  private userModifier(user: User, type?: string) {
    delete user.password;
    if (type == 'all') {
      delete user.admin;
      return user;
    } else {
      delete user.email;
      delete user.admin;
      return user;
    }
  }
}
