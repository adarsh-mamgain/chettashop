import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { ItemsModule } from '../items/items.module';
import { Transaction } from './entities';
import { User } from '../users';
import { Item } from '../items';
import { TransactionsService } from './services';
import { TransactionsController } from './controllers';

// Fix here - TypeOrmModule only call in AppModule
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
