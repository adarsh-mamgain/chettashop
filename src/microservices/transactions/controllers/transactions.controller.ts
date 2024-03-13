import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TransactionDto } from '../dtos/transaction.dto';
import { TransactionsService } from '../services/transactions.service';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransactionInterceptor } from '../interceptors/transaction.interceptor';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { JwtAdminGuard } from '../../../guards/jwt-admin.guard';

@ApiTags('Transactions')
@ApiBearerAuth('JWT')
@UseInterceptors(TransactionInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('all')
  @UseGuards(JwtAdminGuard)
  async getAllUserTransactionHistory(): Promise<TransactionDto[]> {
    return await this.transactionsService.getAllUserTransactionHistory();
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

  @Get('/teams')
  getTransactionTeam(@Request() req) {
    return this.transactionsService.getTeamTransaction(req.user.userId);
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
