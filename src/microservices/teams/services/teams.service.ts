import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entities';
import { CreateTeamDto } from '../dtos';
import { UsersService } from 'src/microservices/users';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team) private repo: Repository<Team>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  findOwner(ownerId: number) {
    return this.usersService.findOne(ownerId);
  }

  async addMember(ownerId: number, userId: number) {
    const owner = await this.findOwner(ownerId);
    const result = await this.usersService.update(userId, {
      teamId: owner.teamId,
    });
    return result;
  }

  async deleteMember(ownerId: number, userId: number) {
    const owner = this.findOwner(ownerId);
    if (owner) {
      const result = this.usersService.update(userId, { teamId: null });
      return result;
    }
  }

  async findAll() {
    const result = await this.repo.createQueryBuilder().getMany();
    return result;
  }

  async create(createTeamDto: CreateTeamDto) {
    const result = await this.repo
      .createQueryBuilder()
      .insert()
      .values(createTeamDto)
      .returning('*')
      .execute();

    await this.usersService.update(createTeamDto.ownerId, {
      teamId: result.raw[0].teamId,
    });

    return result.raw[0];
  }

  async findOne(teamId: number) {
    const result = await this.repo
      .createQueryBuilder('team')
      .where('team.teamId = :teamId', { teamId })
      .getOne();
    return result;
  }

  async findMember(teamId: number) {
    return this.usersService.findByTeam(teamId);
  }

  async find(name: string) {
    return this.repo.find({ where: { name } });
  }

  async update(id: number, attrs: CreateTeamDto) {
    const result = await this.repo
      .createQueryBuilder()
      .update()
      .set(attrs)
      .where('teamId = :id', { id })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  async delete(ownerId: number) {
    const owner = await this.findOwner(ownerId);
    const teamId = owner.teamId;
    console.log(owner.teamId);

    (await this.usersService.findByTeam(teamId)).map(async (user) => {
      this.usersService.update(user.userId, { teamId: null });
    });

    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .where('teamId = :teamId', { teamId })
      .returning('*')
      .execute();
    console.log(result);

    return result.raw[0];
  }
}
