import { ITransaction } from '@myspend/libs';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CategoryEntity } from '../category/category.entity';
import { ProfileEntity } from '../profile/profile.entity';

@Entity({ name: 'transactions' })
export class TransactionEntity implements ITransaction {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => ProfileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: ProfileEntity;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId!: string;

  @ManyToOne(() => CategoryEntity, { eager: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category?: CategoryEntity;

  // Amount stored in VND (integer — no cents)
  @Column({ type: 'bigint', name: 'amount', transformer: { from: (v: string) => parseInt(v, 10), to: (v: number) => v } })
  amount!: number;

  @Column({ type: 'date', name: 'transaction_date' })
  transactionDate!: string;

  @Column({ type: 'varchar', length: 200, name: 'note', nullable: true })
  note?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy?: string | null;

  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy?: string | null;

  @Column({ type: 'uuid', name: 'deleted_by', nullable: true })
  deletedBy?: string | null;
}
