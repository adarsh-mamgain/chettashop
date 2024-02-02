import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './microservices/users/users.entity';
import { APP_PIPE } from '@nestjs/core';
import { Item } from './microservices/items/items.entity';
import { Transaction } from './microservices/transactions/transactions.entity';
import { JwtMiddleware } from './jwt.middleware';
import { ConfigModule } from '@nestjs/config';
import { MicroservicesModule } from './microservices/microservices.module';

@Module({
  imports: [
    MicroservicesModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'adarshmamgain',
      password: '',
      database: 'chettashop',
      entities: [User, Item, Transaction],
      synchronize: true,
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env.development'],
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .exclude({ path: 'auth/signin', method: RequestMethod.POST })
      .forRoutes('*');
  }
}
