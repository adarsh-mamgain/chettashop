import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transactions.entity';
import { User } from '../users/users.entity';
import { Item } from '../items/items.entity';
import { CreateTransactionDto } from './dtos/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Item)
    private itemRepo: Repository<Item>,
  ) {}

  private getDateRangeForAggregate(
    aggregateType: 'day' | 'week' | 'month',
  ): [Date, Date] {
    const now = new Date();
    let start: Date, end: Date;

    switch (aggregateType) {
      case 'day':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          1, // Set to 1
        );
        end = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1, // Set to today
        );
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth() - now.getMonth());
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      default:
        throw new Error('Invalid aggregateType');
    }

    return [start, end];
  }

  private aggregateTotalAmount(
    transactions: Transaction[],
    aggregateType: string,
  ): any[] {
    const aggregatedData: any[] = [];

    // If it's a 'Week' or 'Month' aggregate, create an array of weeks or months
    const aggregateKeys = this.getAggregateKeys(transactions, aggregateType);

    // Initialize aggregatedData with all keys and totalAmount set to 0
    aggregateKeys.forEach((key) => {
      aggregatedData.push({ dateKey: key, totalAmount: 0 });
    });

    // Update totalAmount based on actual transactions
    transactions.forEach((transaction) => {
      const dateKey = this.getDateKey(transaction.timestamp, aggregateType);
      const existingEntry = aggregatedData.find(
        (entry) => entry.dateKey === dateKey,
      );

      if (existingEntry) {
        existingEntry.totalAmount += Number(transaction.totalAmount);
      }
    });

    return aggregatedData;
  }

  private getAggregateKeys(
    transactions: Transaction[],
    aggregateType: string,
  ): string[] {
    const keys: string[] = [];

    transactions.forEach((transaction) => {
      const dateKey = this.getDateKey(transaction.timestamp, aggregateType);
      if (!keys.includes(dateKey)) {
        keys.push(dateKey);
      }
    });

    return keys;
  }

  private getDateKey(timestamp: Date, aggregateType: string): string {
    const date = new Date(timestamp);

    switch (aggregateType) {
      case 'day':
        return `Day ${date.getDate()}`;
      case 'week':
        return `Week ${Math.ceil((date.getDate() - date.getDay() + 1) / 7)}`;
      case 'month':
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      default:
        throw new BadRequestException('Invalid aggregateType');
    }
  }

  async getTransactionAggregate(type: 'day' | 'week' | 'month') {
    const [start, end] = this.getDateRangeForAggregate(type);

    const transactions = await this.transactionRepo
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.item', 'item')
      .where('transaction.timestamp BETWEEN :start AND :end', { start, end })
      .getMany();
    // Fix here
    return this.aggregateTotalAmount(transactions, type);
  }

  async getUserTransactionAggregate(
    type: 'day' | 'week' | 'month',
    userId: number,
  ) {
    const [start, end] = this.getDateRangeForAggregate(type);

    const transactions = await this.transactionRepo
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.item', 'item')
      .where('transaction.timestamp BETWEEN :start AND :end', { start, end })
      .andWhere(userId ? 'user.userId = :userId' : '1=1', { userId })
      .getMany();

    return this.aggregateTotalAmount(transactions, type);
  }

  async getAllUserTransactionHistory() {
    return this.transactionRepo.createQueryBuilder().getMany();
  }

  async getTransaction(id: number) {
    return await this.transactionRepo.findOneBy({ id });
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const { userId, itemId, quantity } = createTransactionDto;

    const user = await this.userRepo.findOneBy({ userId });
    const item = await this.itemRepo.findOneBy({ itemId });

    item.quantity -= quantity;
    await this.itemRepo.save(item);

    const totalAmount = this.calculateTotalAmount(item.price, quantity);
    const now = new Date();
    now.setDate(now.getDate() - 29);
    const timestamp = now.toISOString();

    const transaction = await this.transactionRepo
      .createQueryBuilder()
      .insert()
      .values({ user, item, quantity, totalAmount, timestamp: timestamp })
      .returning('*')
      .execute();
    // Fix here
    return transaction.raw[0];
  }

  async updateTransaction(
    id: number,
    createTransactionDto: CreateTransactionDto,
  ) {
    const existingTransaction = await this.transactionRepo.findOneBy({ id });

    if (!existingTransaction) {
      throw new NotFoundException('Transaction not found');
    }

    const { userId, itemId, quantity } = createTransactionDto;

    const user = await this.userRepo.findOneBy({ userId });
    const item = await this.itemRepo.findOneBy({ itemId });

    if (!user || !item) {
      throw new NotFoundException('User or Item not found');
    }

    item.quantity += existingTransaction.quantity;
    item.quantity -= quantity;
    await this.itemRepo.save(item);

    const timestamp = new Date();

    const totalAmount = this.calculateTotalAmount(item.price, quantity);

    existingTransaction.user = user;
    existingTransaction.item = item;
    existingTransaction.quantity = quantity;
    existingTransaction.totalAmount = totalAmount;
    existingTransaction.timestamp = timestamp;

    const result = await this.transactionRepo
      .createQueryBuilder()
      .update()
      .set(existingTransaction)
      .where('id = :id', { id })
      .returning('*')
      .execute();
    // Fix here
    return result.raw[0];
  }

  private calculateTotalAmount(price: number, quantity: number): number {
    return price * quantity;
  }

  async deleteTransaction(id: number) {
    const transaction = await this.transactionRepo.findOneBy({ id });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const item = await this.itemRepo.findOneBy({
      itemId: transaction.item.itemId,
    });
    item.quantity += transaction.quantity;
    await this.itemRepo.save(item);

    const result = await this.transactionRepo
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id })
      .returning('*')
      .execute();
    // Fix here
    return result.raw[0];
  }
}
