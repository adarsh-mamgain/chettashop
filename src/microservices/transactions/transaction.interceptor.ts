import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { transactionHelper } from './transaction.helper';
import { TransactionsService } from './transactions.service';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly transactionService: TransactionsService) {}
  async intercept(
    context: ExecutionContext,
    handler: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    let helper: string[] = [];
    if (request.url === '/transactions/:id') {
      const transaction = await this.transactionService.getTransaction(
        request.params.id,
      );
      helper = transactionHelper(request, transaction);
    }

    if (helper.length > 0) {
      throw new BadRequestException(helper);
    }

    return handler.handle();
  }
}
