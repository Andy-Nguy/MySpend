import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TransactionEntity } from '../../entities/transaction/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { QueryTransactionsDto } from '../dto/query-transactions.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';

export interface ITransactionPage {
  data: TransactionEntity[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repository: Repository<TransactionEntity>
  ) {}

  create(userId: string, dto: CreateTransactionDto): Promise<TransactionEntity> {
    const entity = this.repository.create({
      userId,
      categoryId: dto.categoryId,
      amount: dto.amount,
      transactionDate: dto.transactionDate,
      note: dto.note ?? null,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.repository.save(entity);
  }

  async findAll(userId: string, query: QueryTransactionsDto): Promise<ITransactionPage> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.repository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'c')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.deleted_at IS NULL');

    if (query.categoryId) {
      qb.andWhere('t.category_id = :categoryId', { categoryId: query.categoryId });
    }
    if (query.from) {
      qb.andWhere('t.transaction_date >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('t.transaction_date <= :to', { to: query.to });
    }

    qb.orderBy('t.transaction_date', 'DESC').addOrderBy('t.created_at', 'DESC');
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  findOne(id: string, userId: string): Promise<TransactionEntity | null> {
    return this.repository.findOne({
      where: { id, userId },
      relations: { category: true },
    });
  }

  async update(id: string, userId: string, dto: UpdateTransactionDto): Promise<TransactionEntity | null> {
    const updates: Partial<TransactionEntity> = { updatedBy: userId };
    if (dto.categoryId !== undefined) updates.categoryId = dto.categoryId;
    if (dto.amount !== undefined) updates.amount = dto.amount;
    if (dto.transactionDate !== undefined) updates.transactionDate = dto.transactionDate;
    if (dto.note !== undefined) updates.note = dto.note;

    await this.repository.update({ id, userId }, updates);
    return this.findOne(id, userId);
  }

  async softDelete(id: string, userId: string): Promise<void> {
    await this.repository.update(
      { id, userId },
      { deletedAt: new Date(), deletedBy: userId }
    );
  }
}
