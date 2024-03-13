import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersService } from '../microservices/users/services/users.service';

@Injectable()
export class JwtAdminGuard implements CanActivate {
  constructor(private usersService: UsersService) {}
  async canActivate(context: ExecutionContext) {
    const request = await context.switchToHttp().getRequest();
    if (!request.user.userId) {
      return false;
    }
    const user = await this.usersService.findOne(request.user.userId);
    return user?.admin || false;
  }
}
