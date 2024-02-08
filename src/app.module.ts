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
import { ThrottlerModule, minutes } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.dev'],
      isGlobal: true,
    }),
    MicroservicesModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.URL,
      ssl: true,
      entities: [User, Item, Transaction],
      synchronize: true,
    }),
    ThrottlerModule.forRoot([{ limit: 3, ttl: minutes(5) }]),
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
