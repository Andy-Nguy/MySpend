import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CategoryTypeEnum } from '@myspend/libs';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepository } from './repository/categories.repository';

// Default categories seeded for every new user (BR-006)
const DEFAULT_SEED_CATEGORIES: Array<{ name: string; type: CategoryTypeEnum; icon: string }> = [
  { name: 'Ăn uống', type: CategoryTypeEnum.EXPENSE, icon: 'utensils' },
  { name: 'Đi lại', type: CategoryTypeEnum.EXPENSE, icon: 'car' },
  { name: 'Mua sắm', type: CategoryTypeEnum.EXPENSE, icon: 'shopping-bag' },
  { name: 'Lương', type: CategoryTypeEnum.INCOME, icon: 'banknote' },
];

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(userId: string, dto: CreateCategoryDto) {
    try {
      const category = await this.categoriesRepository.create(userId, dto);
      this.logger.log(`✅ [Categories] Created category "${dto.name}" for user: ${userId}`);
      return category;
    } catch (err: unknown) {
      // Postgres unique index violation code: 23505
      const pgErr = err as { code?: string };
      if (pgErr?.code === '23505') {
        throw new ConflictException(
          `A category named "${dto.name}" already exists for this type.`
        );
      }
      throw err;
    }
  }

  findAllActive(userId: string) {
    return this.categoriesRepository.findAllActive(userId);
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    const existing = await this.categoriesRepository.findOneActive(id, userId);
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    if (dto.name) {
      // Check for duplicate name conflict after rename
      try {
        const updated = await this.categoriesRepository.update(id, userId, dto);
        this.logger.log(`✅ [Categories] Updated category "${id}" for user: ${userId}`);
        return updated;
      } catch (err: unknown) {
        const pgErr = err as { code?: string };
        if (pgErr?.code === '23505') {
          throw new ConflictException(
            `A category named "${dto.name}" already exists for this type.`
          );
        }
        throw err;
      }
    }

    const updated = await this.categoriesRepository.update(id, userId, dto);
    this.logger.log(`✅ [Categories] Updated category "${id}" for user: ${userId}`);
    return updated;
  }

  async remove(userId: string, id: string) {
    const existing = await this.categoriesRepository.findOneActive(id, userId);
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    await this.categoriesRepository.softDelete(id, userId);
    this.logger.log(`✅ [Categories] Soft-deleted category "${id}" for user: ${userId}`);
    return { success: true };
  }

  async seedDefaultCategories(userId: string): Promise<void> {
    this.logger.log(`🌱 [Categories] Seeding default categories for user: ${userId}`);
    for (const seed of DEFAULT_SEED_CATEGORIES) {
      try {
        await this.categoriesRepository.create(userId, seed);
      } catch (err: unknown) {
        const pgErr = err as { code?: string };
        // Skip if already seeded (unique constraint violation)
        if (pgErr?.code === '23505') continue;
        this.logger.warn(`⚠️ [Categories] Seed failed for "${seed.name}": ${String(err)}`);
      }
    }
    this.logger.log(`✅ [Categories] Default categories seeded for user: ${userId}`);
  }
}
