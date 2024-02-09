import { Item } from '../entities/items.entity';

export function itemsHelper(request: any, item: Item = null): any[] {
  const exceptions: string[] = [];

  if (item === null && request.route.path === '/items/:id') {
    exceptions.push('Item not found');
  }

  return exceptions;
}
