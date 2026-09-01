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

  findAllActive(userId: string): Promise<CategoryEntity[]> {
    return this.repository.find({
      where: { userId },
      withDeleted: false,
      order: { type: 'ASC', name: 'ASC' },
    });
  }

  findOneActive(id: string, userId: string): Promise<CategoryEntity | null> {
    return this.repository.findOne({ where: { id, userId } });
  }

  async update(id: string, userId: string, dto: UpdateCategoryDto): Promise<CategoryEntity | null> {
    const updates: Partial<CategoryEntity> = { updatedBy: userId };
    if (dto.name !== undefined) updates.name = dto.name.trim();
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
