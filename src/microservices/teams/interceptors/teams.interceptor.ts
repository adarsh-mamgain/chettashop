import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { teamsHelper } from '../helpers';
import { TeamsService } from '../services';
import { UsersService } from 'src/microservices/users';

@Injectable()
export class TeamsInterceptor implements NestInterceptor {
  constructor(private teamService: TeamsService) {}

  async intercept(
    context: ExecutionContext,
    handler: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    let helper: string[];

    if (
      (request.route.path === '/teams' && request.method === 'POST') ||
      (request.route.path === '/teams/:id' && request.method === 'PUT')
    ) {
      const teams = await this.teamService.find(request.body.name);
      helper = teamsHelper(request, teams[0]);
    } else {
      const teams = await this.teamService.findOne(parseInt(request.params.id));
      helper = teamsHelper(request, teams);
    }

    if (helper.length > 0) {
      throw new BadRequestException(helper);
    }

    return handler.handle();
  }
}
