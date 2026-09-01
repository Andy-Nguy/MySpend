import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryEntity } from '../entities/category/category.entity';
import { TransactionEntity } from '../entities/transaction/transaction.entity';
import { CategoriesModule } from '../categories/categories.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionsRepository } from './repository/transactions.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity, CategoryEntity]),
    CategoriesModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository],
  exports: [TransactionsService, TransactionsRepository],
})
export class TransactionsModule {}
