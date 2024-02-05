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
  userId: number;

  @Expose()
  itemId: number;
}
