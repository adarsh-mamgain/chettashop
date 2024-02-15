import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities';
import { CreateUserDto } from '../dtos';

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
      .leftJoinAndSelect('user.teamId', 'team')
      .where('user.userId = :userId', { userId })
      .getOne();
    return this.userModifier(result, 'findOne');
  }

  find(email: string) {
    return this.repo.find({ where: { email } });
  }

  async findByTeam(teamId: number) {
    return this.repo.find({ where: { teamId } });
  }

  async findAll() {
    const result = await this.repo.createQueryBuilder().getMany();
    return result.map((user) => {
      this.userModifier(user, 'all');
      return user;
    });
  }

  async update(id: number, attrs: Partial<CreateUserDto>) {
    const user = await this.findOne(id);

    attrs.email ? (user.email = attrs.email) : user.email;
    attrs.password
      ? (user.password = await bcrypt.hash(attrs.password, 10))
      : user.password;
    attrs.admin === true || attrs.admin === false
      ? (user.admin = attrs.admin)
      : user.admin;
    attrs.teamId ? (user.teamId = attrs.teamId) : user.teamId;
    attrs.teamId === null ? (user.teamId = null) : user.teamId;

    const result = await this.repo
      .createQueryBuilder()
      .update()
      .set(user)
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
    let teamId: any;

    if (typeof user.teamId != 'number') {
      teamId = Object(user.teamId);
      user.teamId = teamId.teamId;
    }

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
