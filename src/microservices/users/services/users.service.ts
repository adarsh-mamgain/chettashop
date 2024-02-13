import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../../auth/dtos/create-user.dto';
import { User } from '../entities';

const bcrypt = require('bcrypt');

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(createUserDto: CreateUserDto) {
    const result = await this.repo
      .createQueryBuilder()
      .insert()
      .values(createUserDto)
      .returning('*')
      .execute();

    return this.userModifier(result.raw[0]);
  }

  async findOne(userId: number) {
    const result = await this.repo
      .createQueryBuilder('user')
      .where('user.userId = :userId', { userId })
      .getOne();
    return this.userModifier(result, 'findOne');
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

  async update(id: number, attrs: Partial<CreateUserDto>) {
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
    if (type == 'findOne') {
      return user;
    } else if (type == 'all') {
      delete user.admin;
      return user;
    } else {
      delete user.email;
      delete user.admin;
      return user;
    }
  }
}
