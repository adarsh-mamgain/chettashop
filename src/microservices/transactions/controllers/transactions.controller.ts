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
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { TransactionDto } from '../dtos/transaction.dto';
import { TransactionsService } from '../services/transactions.service';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JwtAdminGuard } from 'src/guards/jwt-admin.guard';
import { TransactionInterceptor } from '../interceptors/transaction.interceptor';

@ApiTags('Transactions')
@UseGuards(JwtAuthGuard)
@Serialize(TransactionDto)
@UseInterceptors(TransactionInterceptor)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('all')
  @UseGuards(JwtAdminGuard)
  async getAllUserTransactionHistory() {
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
  @Serialize(TransactionDto)
  createTransaction(@Body() body: CreateTransactionDto) {
    return this.transactionsService.createTransaction(body);
  }

  @Get(':id')
  @Serialize(TransactionDto)
  getTransaction(@Param('id') id: number) {
    return this.transactionsService.getTransaction(id);
  }

  @Put(':id')
  @Serialize(TransactionDto)
  updateTransaction(
    @Param('id') id: number,
    @Body() body: CreateTransactionDto,
  ) {
    return this.transactionsService.updateTransaction(id, body);
  }

  @Delete(':id')
  @Serialize(TransactionDto)
  deleteTransaction(@Param('id') id: number) {
    return this.transactionsService.deleteTransaction(id);
  }
}
