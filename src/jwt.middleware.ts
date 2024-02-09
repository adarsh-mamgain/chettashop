import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { User } from './microservices/users';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    let [type, token] = req.headers.authorization?.split(' ') ?? [];
    token = type === 'Bearer' ? token : undefined;

    if (token) {
      try {
        const decoded = this.jwtService.verify(token, {
          secret: process.env.SECRET_KEY,
        });
        req.user = decoded;
      } catch (error) {
        // handle jwt error
        console.log(error);
      }
    }
    next();
  }
}
