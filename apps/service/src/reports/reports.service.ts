import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICategoryBreakdownItem, IDashboardSummary, IReportStats } from '@myspend/libs';

import { TransactionEntity } from '../entities/transaction/transaction.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { ProfilesRepository } from '../profiles/repository/profiles.repository';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly transactionsService: TransactionsService,
    private readonly profilesRepository: ProfilesRepository,
  ) {}

  async getSummary(userId: string, year: number, month: number): Promise<IDashboardSummary> {
    // Compute first and last day of the requested month
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Aggregate query: JOIN category to sum income vs expense for the selected month
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
    const netSavings = income - expense;

    // Fetch top 7 recent transactions within the selected month for dashboard (P0-05)
    const recentPage = await this.transactionsService.findAll(userId, {
      from,
      to,
      limit: 7,
      page: 1,
    });

    // Calculate actual total balance (P0-06): initialBalance + all-time income - all-time expense
    const profile = await this.profilesRepository.findById(userId);
    const initialBalance = Number(profile?.initialBalance ?? 0);

    const allTimeAggregate = await this.transactionRepository
      .createQueryBuilder('t')
      .leftJoin('t.category', 'c')
      .select([
        `SUM(CASE WHEN c.type = 'income'  THEN t.amount ELSE 0 END) AS income`,
        `SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END) AS expense`,
      ])
      .where('t.user_id = :userId', { userId })
      .andWhere('t.deleted_at IS NULL')
      .getRawOne<{ income: string; expense: string }>();

    const allTimeIncome = parseInt(allTimeAggregate?.income ?? '0', 10) || 0;
    const allTimeExpense = parseInt(allTimeAggregate?.expense ?? '0', 10) || 0;
    const totalBalance = initialBalance + allTimeIncome - allTimeExpense;

    this.logger.log(
      `📊 [Reports] Monthly summary for user ${userId} (${year}-${month}): income=${income}, expense=${expense}, netSavings=${netSavings}, totalBalance=${totalBalance}`,
    );

    return {
      income,
      expense,
      balance: netSavings, // Backward-compatible
      netSavings,
      totalBalance,
      recentTransactions: recentPage.data as any,
    };
  }

  async getStats(userId: string, from: string, to: string, categoryId?: string): Promise<IReportStats> {
    // Parse UTC dates to avoid any timezone shifts or DST issues
    const [startYear, startMonth, startDay] = from.split('-').map(Number);
    const [endYear, endMonth, endDay] = to.split('-').map(Number);
    const startUtc = Date.UTC(startYear, startMonth - 1, startDay);
    const endUtc = Date.UTC(endYear, endMonth - 1, endDay);
    const msPerDay = 24 * 60 * 60 * 1000;

    // P0-03: Inclusive number of days (e.g., from day 1 to day 3 is 3 days)
    const periodDays = Math.round((endUtc - startUtc) / msPerDay) + 1;

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

    // P0-02: Calculate non-overlapping previous period spending
    // Previous period ends on the day right before startUtc
    const prevEndUtc = startUtc - msPerDay;
    const prevStartUtc = prevEndUtc - (periodDays - 1) * msPerDay;
    const prevFrom = new Date(prevStartUtc).toISOString().split('T')[0];
    const prevTo = new Date(prevEndUtc).toISOString().split('T')[0];

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

    // P0-03: Average daily spending correctly divided by periodDays
    const averageDailySpending = Math.round(totalSpending / Math.max(periodDays, 1));

    // P0-04: User configured budget from profile
    const profile = await this.profilesRepository.findById(userId);
    const budgetLimit = profile?.monthlyBudget ? Number(profile.monthlyBudget) : 0;
    const remainingBudget = budgetLimit > 0 ? budgetLimit - totalSpending : 0;

    this.logger.log(
      `📊 [Reports] Stats for user ${userId} (${from} to ${to}, ${periodDays} days): total=${totalSpending}, prev=${previousPeriodSpending}, budgetLimit=${budgetLimit}`,
    );

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
