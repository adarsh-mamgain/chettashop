import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';

const bcrypt = require('bcrypt');

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(email: string, password: string, admin: boolean) {
    const user = await this.repo
      .createQueryBuilder()
      .insert()
      .values({ email, password, admin })
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

  findAll() {
    return this.repo.createQueryBuilder().getMany();
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

    return result.raw[0];
  }

  async remove(id: number) {
    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .where('userId = :id', { id })
      .returning('*')
      .execute();

    return result.raw[0];
  }
}
