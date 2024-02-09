import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import {
  ThrottlerGenerateKeyFunction,
  ThrottlerGetTrackerFunction,
  ThrottlerGuard,
  ThrottlerOptions,
} from '@nestjs/throttler';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const limiter1 = new RateLimiterMemory({
  points: 3,
  duration: 300,
});

const limiter2 = new RateLimiterMemory({
  points: 5,
  duration: 300,
});

@Injectable()
export class CustomThrottlerGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const key = request.headers['x-forwarded-for']
      ? request.headers['x-forwarded-for'] + request.body.email
      : request.ip + request.body.email;

    if (request.url == '/auth/signup') {
      limiter1.consume(key).catch(() => {
        response.status(429).json({ message: 'Too many requests.' });
      });
    }
    if (request.url == '/auth/signin') {
      limiter2.consume(key).catch(() => {
        response.status(429).json({ message: 'Too many requests.' });
      });
    }
    return true;
  }
}
