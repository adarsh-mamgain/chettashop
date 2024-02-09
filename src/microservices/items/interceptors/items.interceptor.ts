import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { itemsHelper } from '../helpers/items.helper';
import { ItemsService } from '../services/items.service';

@Injectable()
export class ItemsInterceptor implements NestInterceptor {
  constructor(private itemService: ItemsService) {}

  async intercept(
    context: ExecutionContext,
    handler: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    let helper: string[];

    if (
      request.route.path === '/items' ||
      request.route.path === '/items/all'
    ) {
      helper = itemsHelper(request);
    } else {
      const item = await this.itemService.findOne(parseInt(request.params.id));
      helper = itemsHelper(request, item);
    }

    if (helper.length > 0) {
      throw new NotFoundException(helper);
    }

    return handler.handle();
  }
}
