import { Module } from '@nestjs/common';
import { TeamsController } from './controllers';
import { TeamsService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities';
import { UsersModule } from '../users/users.module';
import { TeamOwnerGuard } from 'src/guards/teamOwner.guard';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Team])],
  controllers: [TeamsController],
  providers: [TeamsService, TeamOwnerGuard],
})
export class TeamsModule {}
