import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { transactionHelper } from './transaction.helper';
import { UsersService } from 'src/microservices/users/users.service';
import { ItemsService } from 'src/microservices/items/items.service';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(
    private readonly userService: UsersService,
    private readonly itemService: ItemsService,
  ) {}
  async intercept(
    context: ExecutionContext,
    handler: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const user = await this.userService.findOne(request.body.userId);
    const item = await this.itemService.findOne(request.body.itemId);

    const helper = transactionHelper(request, user, item);

    if (helper.length > 0) {
      throw new BadRequestException(helper);
    }

    return handler.handle();
  }
}
