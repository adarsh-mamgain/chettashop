import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities';
import { ItemsController } from './controllers';
import { ItemsService } from './services';
import { UsersModule } from '../users/users.module';

// Fix here - TypeOrmModule only call in AppModule
@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Item])],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
