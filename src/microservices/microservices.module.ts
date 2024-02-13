import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TeamsModule } from './teams/teams.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TeamsModule,
    ItemsModule,
    TransactionsModule,
  ],
  controllers: [],
  providers: [],
})
export class MicroservicesModule {}
