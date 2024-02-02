import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [AuthModule, UsersModule, ItemsModule, TransactionsModule],
  controllers: [],
  providers: [],
})
export class MicroservicesModule {}
