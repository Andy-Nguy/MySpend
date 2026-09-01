import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoryEntity } from '../../entities/category/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repository: Repository<CategoryEntity>
  ) {}

  create(userId: string, dto: CreateCategoryDto): Promise<CategoryEntity> {
    const entity = this.repository.create({
      userId,
      name: dto.name.trim(),
      type: dto.type,
      icon: dto.icon,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.repository.save(entity);
  }

  async findAllActive(userId: string): Promise<any[]> {
    const rows = await this.repository
      .createQueryBuilder('c')
      .leftJoin('transactions', 't', 't.category_id = c.id AND t.deleted_at IS NULL')
      .select([
        'c.id AS id',
        'c.user_id AS "userId"',
        'c.name AS name',
        'c.type AS type',
        'c.icon AS icon',
        'c.created_at AS "createdAt"',
        'c.updated_at AS "updatedAt"',
        'COUNT(t.id) AS "transactionCount"',
      ])
      .where('c.user_id = :userId', { userId })
      .andWhere('c.deleted_at IS NULL')
      .groupBy('c.id')
      .orderBy('c.type', 'ASC')
      .addOrderBy('c.name', 'ASC')
      .getRawMany();

    return rows.map((r) => {
      const count = parseInt(r.transactionCount, 10) || 0;
      return {
        id: r.id,
        userId: r.userId,
        name: r.name,
        type: r.type,
        icon: r.icon,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        transactionCount: count,
        hasTransactions: count > 0,
      };
    });
  }

  findOneActive(id: string, userId: string): Promise<CategoryEntity | null> {
    return this.repository.findOne({ where: { id, userId } });
  }

  async update(id: string, userId: string, dto: UpdateCategoryDto): Promise<CategoryEntity | null> {
    const updates: Partial<CategoryEntity> = { updatedBy: userId };
    if (dto.name !== undefined) updates.name = dto.name.trim();
    if (dto.type !== undefined) updates.type = dto.type;
    if (dto.icon !== undefined) updates.icon = dto.icon;

    await this.repository.update({ id, userId }, updates);
    return this.findOneActive(id, userId);
  }

  async softDelete(id: string, userId: string): Promise<void> {
    await this.repository.update(
      { id, userId },
      { deletedAt: new Date(), deletedBy: userId }
    );
  }
}
