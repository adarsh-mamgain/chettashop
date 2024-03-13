import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { authHelper } from '../helpers/auth.helper';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(private userService: UsersService) {}

  async intercept(
    context: ExecutionContext,
    handler: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    let helper: string[] = [];
    if (request.url !== '/auth/logout') {
      const user = await this.userService.find(request.body.email);
      helper = authHelper(request, user);
    } else {
      helper = authHelper(request);
    }

    if (helper.length > 0) {
      throw new BadRequestException(helper);
    }

    return handler.handle();
  }
}
