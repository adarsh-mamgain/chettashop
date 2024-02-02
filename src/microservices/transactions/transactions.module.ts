import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transactions.entity';
import { User } from '../users/users.entity';
import { Item } from '../items/items.entity';
import { UsersModule } from 'src/microservices/users/users.module';
import { ItemsModule } from 'src/microservices/items/items.module';

@Module({
  imports: [
    UsersModule,
    ItemsModule,
    TypeOrmModule.forFeature([Transaction, User, Item]),
  ],
  providers: [TransactionsService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
