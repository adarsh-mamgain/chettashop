import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { usersHelper } from '../helpers/users.helper';
import { UsersService } from '../services';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(private userService: UsersService) {}

  async intercept(
    context: ExecutionContext,
    handler: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    let helper: string[];

    if (
      request.route.path === '/users/whoami' ||
      request.route.path === '/users/all'
    ) {
      helper = usersHelper(request);
    } else {
      const user = await this.userService.findOne(parseInt(request.params.id));
      helper = usersHelper(request, user);
    }

    if (helper.length > 0) {
      throw new NotFoundException(helper);
    }

    return handler.handle();
  }
}
