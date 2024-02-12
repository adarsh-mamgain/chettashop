import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TransactionDto } from '../dtos/transaction.dto';
import { TransactionsService } from '../services/transactions.service';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JwtAdminGuard } from 'src/guards/jwt-admin.guard';
import { TransactionInterceptor } from '../interceptors/transaction.interceptor';

@ApiTags('Transactions')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransactionInterceptor)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('all')
  @UseGuards(JwtAdminGuard)
  async getAllUserTransactionHistory(): Promise<TransactionDto[]> {
    const test = await this.transactionsService.getAllUserTransactionHistory();
    return test;
  }

  @Get('aggregate')
  @UseGuards(JwtAdminGuard)
  getTransactionAggregate(@Query('type') type: 'day' | 'week' | 'month') {
    return this.transactionsService.getTransactionAggregate(type);
  }

  @Get('aggregate/users')
  @UseGuards(JwtAdminGuard)
  getTransactionAggregateUsers(
    @Query('type') type: 'day' | 'week' | 'month',
    @Query('userId') userId: number,
  ) {
    return this.transactionsService.getUserTransactionAggregate(type, userId);
  }

  @Post()
  createTransaction(
    @Body() body: CreateTransactionDto,
  ): Promise<TransactionDto> {
    return this.transactionsService.createTransaction(body);
  }

  @Get(':id')
  getTransaction(@Param('id') id: number): Promise<TransactionDto> {
    return this.transactionsService.getTransaction(id);
  }

  @Put(':id')
  updateTransaction(
    @Param('id') id: number,
    @Body() body: CreateTransactionDto,
  ): Promise<TransactionDto> {
    return this.transactionsService.updateTransaction(id, body);
  }

  @Delete(':id')
  deleteTransaction(@Param('id') id: number): Promise<TransactionDto> {
    return this.transactionsService.deleteTransaction(id);
  }
}
