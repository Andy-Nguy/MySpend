import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICategoryBreakdownItem, IDashboardSummary, IReportStats } from '@myspend/libs';

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

  async getStats(userId: string, from: string, to: string, categoryId?: string): Promise<IReportStats> {
    const startDate = new Date(from);
    const endDate = new Date(to);

    // Calculate current period total spending
    const currentTotal = await this.transactionRepository
      .createQueryBuilder('t')
      .leftJoin('t.category', 'c')
      .select('SUM(t.amount)', 'total')
      .where('t.user_id = :userId', { userId })
      .andWhere("c.type = 'expense'")
      .andWhere('t.deleted_at IS NULL')
      .andWhere('t.transaction_date BETWEEN :from AND :to', { from, to })
      .andWhere(categoryId ? 'c.id = :categoryId' : '1=1', { categoryId })
      .getRawOne<{ total: string }>();

    const totalSpending = parseInt(currentTotal?.total ?? '0', 10) || 0;

    // Calculate previous period spending
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const prevStartDate = new Date(startDate.getTime() - diffTime);
    const prevEndDate = new Date(endDate.getTime() - diffTime);
    const prevFrom = prevStartDate.toISOString().split('T')[0];
    const prevTo = prevEndDate.toISOString().split('T')[0];

    const prevTotal = await this.transactionRepository
      .createQueryBuilder('t')
      .leftJoin('t.category', 'c')
      .select('SUM(t.amount)', 'total')
      .where('t.user_id = :userId', { userId })
      .andWhere("c.type = 'expense'")
      .andWhere('t.deleted_at IS NULL')
      .andWhere('t.transaction_date BETWEEN :from AND :to', { from: prevFrom, to: prevTo })
      .andWhere(categoryId ? 'c.id = :categoryId' : '1=1', { categoryId })
      .getRawOne<{ total: string }>();

    const previousPeriodSpending = parseInt(prevTotal?.total ?? '0', 10) || 0;

    // Average daily spending
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const averageDailySpending = Math.round(totalSpending / days);

    // Budget (mocked for now as requested)
    const budgetLimit = 10000000;
    const remainingBudget = budgetLimit - totalSpending;

    this.logger.log(`📊 [Reports] Stats for user ${userId}: total=${totalSpending}, prev=${previousPeriodSpending}`);

    return {
      totalSpending,
      previousPeriodSpending,
      averageDailySpending,
      remainingBudget,
      budgetLimit,
    };
  }

  async getCategoryBreakdown(
    userId: string,
    from: string,
    to: string,
    categoryId?: string
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
      .andWhere(categoryId ? 'c.id = :categoryId' : '1=1', { categoryId })
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
