import { ICategory } from '@myspend/libs';
import { CategoryTypeEnum } from '@myspend/libs';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ProfileEntity } from '../profile/profile.entity';

@Entity({ name: 'categories' })
export class CategoryEntity implements ICategory {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => ProfileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: ProfileEntity;

  @Column({ type: 'varchar', length: 100, name: 'name' })
  name!: string;

  @Column({
    type: 'varchar',
    length: 10,
    name: 'type',
    enum: CategoryTypeEnum,
  })
  type!: CategoryTypeEnum;

  @Column({ type: 'varchar', length: 50, name: 'icon' })
  icon!: string;

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
