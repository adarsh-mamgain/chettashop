import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class SigninThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Request): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let tracker: string;
      req.headers['x-forwarded-for']
        ? (tracker = req.headers['x-forwarded-for'].toString())
        : (tracker = req.ip);

      resolve(tracker);
    });
  }
}
