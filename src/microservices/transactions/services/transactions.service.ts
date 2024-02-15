import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/microservices/users';
import { Item } from 'src/microservices/items';
import { Transaction } from '../entities';
import { CreateTransactionDto } from '../dtos';

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
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth() - now.getMonth());
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      default:
        throw new BadRequestException('Invalid aggregate type');
    }

    return [start, end];
  }

  private aggregateTotalAmount(
    transactions: Transaction[],
    aggregateType: string,
  ): any[] {
    const aggregatedData: any[] = [];

    const aggregateKeys = this.getAggregateKeys(transactions, aggregateType);

    aggregateKeys.forEach((key) => {
      aggregatedData.push({ dateKey: key, totalAmount: 0 });
    });

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
        throw new BadRequestException('Invalid aggregate type');
    }
  }

  async getTransactionAggregate(type: 'day' | 'week' | 'month') {
    const [start, end] = this.getDateRangeForAggregate(type);

    const transactions = await this.transactionRepo
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.userId', 'user')
      .leftJoinAndSelect('transaction.itemId', 'item')
      .where('transaction.timestamp BETWEEN :start AND :end', { start, end })
      .getMany();
    return this.aggregateTotalAmount(transactions, type);
  }

  async getUserTransactionAggregate(
    type: 'day' | 'week' | 'month',
    userId: number,
  ) {
    const [start, end] = this.getDateRangeForAggregate(type);

    const transactions = await this.transactionRepo
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.userId', 'user')
      .leftJoinAndSelect('transaction.itemId', 'item')
      .where('transaction.timestamp BETWEEN :start AND :end', { start, end })
      .andWhere('user.userId = :userId', { userId })
      .getMany();

    if (transactions[0] == null) {
      throw new NotFoundException('No transactions found for user');
    }

    return this.aggregateTotalAmount(transactions, type);
  }

  async getTeamTransaction(userId: number) {
    const { teamId } = Object(
      await this.userRepo.findOne({ where: { userId } }),
    );
    const getTeamId = teamId.teamId;

    const transactions = await this.transactionRepo
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.userId', 'user')
      .leftJoinAndSelect('user.teamId', 'team')
      .leftJoinAndSelect('transaction.itemId', 'item')
      .where('team.teamId = :getTeamId', { getTeamId })
      .getMany();

    return transactions.map((transaction) =>
      this.transactionModifier(transaction),
    );
  }

  async getAllUserTransactionHistory() {
    const result = await this.transactionRepo
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.userId', 'user')
      .leftJoinAndSelect('transaction.itemId', 'item')
      .getMany();
    return result.map((transaction) => this.transactionModifier(transaction));
  }

  async getTransaction(id: number) {
    const transaction = await this.transactionRepo.findOneBy({ id });
    return this.transactionModifier(transaction);
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const { userId, itemId, quantity } = createTransactionDto;

    const item = await this.itemRepo.findOneBy({ itemId });

    item.quantity -= quantity;
    await this.itemRepo.save(item);

    const totalAmount = this.calculateTotalAmount(item.price, quantity);

    const transaction = await this.transactionRepo
      .createQueryBuilder()
      .insert()
      .values({ userId, itemId, quantity, totalAmount })
      .returning('*')
      .execute();
    return this.transactionModifier(transaction.raw[0]);
  }

  async updateTransaction(
    id: number,
    createTransactionDto: CreateTransactionDto,
  ) {
    const existingTransaction = await this.transactionRepo.findOneBy({ id });

    const { userId, itemId, quantity } = createTransactionDto;

    const user = await this.userRepo.findOneBy({ userId });
    const item = await this.itemRepo.findOneBy({ itemId });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    item.quantity += existingTransaction.quantity;
    item.quantity -= quantity;
    await this.itemRepo.save(item);

    const totalAmount = this.calculateTotalAmount(item.price, quantity);

    existingTransaction.userId = user.userId;
    existingTransaction.itemId = item.itemId;
    existingTransaction.quantity = quantity;
    existingTransaction.totalAmount = totalAmount;

    const transaction = await this.transactionRepo
      .createQueryBuilder()
      .update()
      .set(existingTransaction)
      .where('id = :id', { id })
      .returning('*')
      .execute();
    return this.transactionModifier(transaction.raw[0]);
  }

  private calculateTotalAmount(price: number, quantity: number): number {
    return price * quantity;
  }

  async deleteTransaction(id: number) {
    const transaction = await this.transactionRepo.findOneBy({ id });

    const transactionItemId = Object(transaction.itemId);
    const item = await this.itemRepo.findOneBy({
      itemId: transactionItemId.itemId,
    });

    item.quantity += transaction.quantity;
    await this.itemRepo.save(item);

    const result = await this.transactionRepo
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return this.transactionModifier(result.raw[0]);
  }

  private transactionModifier(transaction: Transaction) {
    let userId: any, itemId: any;
    if (typeof transaction.userId != 'number') {
      userId = Object(transaction.userId);
      itemId = Object(transaction.itemId);
    }
    const result = {
      ...transaction,
      id: Number(transaction.id),
      quantity: Number(transaction.quantity),
      userId: userId ? Number(userId.userId) : transaction.userId,
      itemId: itemId ? Number(itemId.itemId) : transaction.itemId,
    };

    return result;
  }
}
