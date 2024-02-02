import { Item } from 'src/microservices/items/items.entity';
import { User } from 'src/microservices/users/users.entity';

export function transactionHelper(request: any, user: User, item: Item): any[] {
  const exceptions: string[] = [];

  // Fix here
  if (
    request.route.path === !'/transactions/aggregate' &&
    request.route.path === !'/transactions/'
  ) {
    if (!user) {
      exceptions.push('User not found');
      // throw new NotFoundException('User or Item not found');
    }
    if (!item) {
      exceptions.push('Item not found');
    }
  }
  if (request.route.path == 'transactions/aggregate/users') {
    if (!item) {
      exceptions.push('Item not found');
    }
  }
  // if (item.quantity != null && item.quantity < request.body.quantity) {
  //   exceptions.push(
  //     `Order quantity cannot be greater than item quantity. Item quantity: ${item.quantity} Order quantity: ${request.body.quantity}`,
  //   );
  //   // throw new BadRequestException(
  //   //   `Order quantity cannot be greater than item quantity. Item quantity: ${item.quantity} Order quantity: ${quantity}`,
  //   // );
  // }

  return exceptions;
}
