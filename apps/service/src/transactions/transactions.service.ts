import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { CategoriesRepository } from '../categories/repository/categories.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsRepository } from './repository/transactions.repository';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async create(userId: string, dto: CreateTransactionDto) {
    // 1. Verify category exists, is active, and belongs to this user
    const category = await this.categoriesRepository.findOneActive(
      dto.categoryId,
      userId,
    );
    if (!category) {
      throw new NotFoundException(
        'Category not found or does not belong to you',
      );
    }

    // 2. Validate transactionDate is not in the future (BR-004)
    this.assertTransactionDateNotInFuture(dto.transactionDate);

    const transaction = await this.transactionsRepository.create(userId, dto);
    this.logger.log(
      ` [Transactions] Created transaction ${transaction.id} for user: ${userId}`,
    );
    return transaction;
  }

  findAll(userId: string, query: QueryTransactionsDto) {
    return this.transactionsRepository.findAll(userId, query);
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const existing = await this.transactionsRepository.findOne(id, userId);
    if (!existing) {
      throw new NotFoundException('Transaction not found');
    }

    // If changing category, validate the new one
    if (dto.categoryId && dto.categoryId !== existing.categoryId) {
      const category = await this.categoriesRepository.findOneActive(
        dto.categoryId,
        userId,
      );
      if (!category) {
        throw new NotFoundException(
          'Category not found or does not belong to you',
        );
      }
    }

    // Validate new date if provided
    if (dto.transactionDate) {
      this.assertTransactionDateNotInFuture(dto.transactionDate);
    }

    const updated = await this.transactionsRepository.update(id, userId, dto);
    this.logger.log(
      ` [Transactions] Updated transaction ${id} for user: ${userId}`,
    );
    return updated;
  }

  private assertTransactionDateNotInFuture(transactionDate: string) {
    // Validate transactionDate is not in the future (BR-004)
    // To accommodate users across all timezones (e.g. UTC+7 in Vietnam or up to UTC+14 in Pacific),
    // allow any date that has already begun anywhere on Earth (Date.now() + 14 hours).
    const maxAllowedDate = new Date(Date.now() + 14 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    if (transactionDate > maxAllowedDate) {
      throw new BadRequestException('Transaction date cannot be in the future');
    }
  }

  async remove(userId: string, id: string) {
    const existing = await this.transactionsRepository.findOne(id, userId);
    if (!existing) {
      throw new NotFoundException('Transaction not found');
    }

    await this.transactionsRepository.softDelete(id, userId);
    this.logger.log(
      ` [Transactions] Soft-deleted transaction ${id} for user: ${userId}`,
    );
    return { success: true };
  }
}
