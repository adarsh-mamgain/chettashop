import { Expose } from 'class-transformer';

export class ItemDto {
  @Expose()
  itemId: number;

  @Expose()
  name: string;

  @Expose()
  price: number;

  @Expose()
  quantity: number;
}
