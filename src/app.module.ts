import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, minutes } from '@nestjs/throttler';
import { MicroservicesModule } from './microservices/microservices.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtMiddleware } from './jwt.middleware';
import { CacheModule } from '@nestjs/cache-manager';

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
      autoLoadEntities: true,
      synchronize: true,
    }),
    ThrottlerModule.forRoot([{ limit: 3, ttl: minutes(5) }]),
    CacheModule.register({
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
