import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransactionEntity } from '../entities/transaction/transaction.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity]),
    TransactionsModule,
    ProfilesModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
