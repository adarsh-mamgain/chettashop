import { Expose } from 'class-transformer';

export class TransactionDto {
  @Expose()
  id: number;

  @Expose()
  quantity: number;

  @Expose()
  totalAmount: number;

  @Expose()
  timestamp: Date;

  @Expose()
  user: {
    userId: number;
    email: string;
    admin: boolean;
  };

  @Expose()
  item: {
    itemId: number;
    name: string;
    price: number;
    quantity: number;
  };
}
