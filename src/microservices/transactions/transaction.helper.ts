import { Transaction } from './transactions.entity';

export function transactionHelper(
  request: any,
  transaction: Transaction,
): any[] {
  const exceptions: string[] = [];

  if (!transaction && request.route.path === '/transactions/:id') {
    exceptions.push('Transaction not found');
  }

  return exceptions;
}
