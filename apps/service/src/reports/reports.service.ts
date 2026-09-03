import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICategoryBreakdownItem, IDashboardSummary } from '@myspend/libs';

import { TransactionEntity } from '../entities/transaction/transaction.entity';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly transactionsService: TransactionsService
  ) {}

  async getSummary(userId: string, year: number, month: number): Promise<IDashboardSummary> {
    // Compute first and last day of the requested month
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Aggregate query: JOIN category to sum income vs expense
    const aggregate = await this.transactionRepository
      .createQueryBuilder('t')
      .leftJoin('t.category', 'c')
      .select([
        `SUM(CASE WHEN c.type = 'income'  THEN t.amount ELSE 0 END) AS income`,
        `SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END) AS expense`,
      ])
      .where('t.user_id = :userId', { userId })
      .andWhere('t.deleted_at IS NULL')
      .andWhere('t.transaction_date BETWEEN :from AND :to', { from, to })
      .getRawOne<{ income: string; expense: string }>();

    const income = parseInt(aggregate?.income ?? '0', 10) || 0;
    const expense = parseInt(aggregate?.expense ?? '0', 10) || 0;

    // Fetch top 7 recent transactions for dashboard
    const recentPage = await this.transactionsService.findAll(userId, { limit: 7, page: 1 });

    this.logger.log(`📊 [Reports] Monthly summary for user ${userId}: income=${income}, expense=${expense}`);

    return {
      income,
      expense,
      balance: income - expense,
      recentTransactions: recentPage.data as any,
    };
  }

  async getCategoryBreakdown(
    userId: string,
    from: string,
    to: string
  ): Promise<ICategoryBreakdownItem[]> {
    const rows = await this.transactionRepository
      .createQueryBuilder('t')
      .leftJoin('t.category', 'c')
      .select([
        'c.id AS "categoryId"',
        'c.name AS "categoryName"',
        'c.icon AS "icon"',
        'SUM(t.amount) AS "total"',
      ])
      .where('t.user_id = :userId', { userId })
      .andWhere('t.deleted_at IS NULL')
      .andWhere("c.type = 'expense'")
      .andWhere('t.transaction_date BETWEEN :from AND :to', { from, to })
      .groupBy('c.id, c.name, c.icon')
      .orderBy('"total"', 'DESC')
      .getRawMany<{ categoryId: string; categoryName: string; icon: string; total: string }>();

    const grandTotal = rows.reduce((sum, r) => sum + parseInt(r.total, 10), 0);

    const result: ICategoryBreakdownItem[] = rows.map((r) => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      icon: r.icon,
      total: parseInt(r.total, 10),
      percentage: grandTotal > 0 ? Math.round((parseInt(r.total, 10) / grandTotal) * 10000) / 100 : 0,
    }));

    this.logger.log(`📊 [Reports] Category breakdown for user ${userId}: ${result.length} categories`);
    return result;
  }
}
