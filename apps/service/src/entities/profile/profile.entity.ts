import { IProfile } from '@myspend/libs';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'profiles' })
export class ProfileEntity implements IProfile {
  @PrimaryColumn({ type: 'uuid', name: 'id' })
  id!: string;

  @Column({ type: 'text', name: 'email', unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 100, name: 'first_name', nullable: true })
  firstName?: string | null;

  @Column({ type: 'varchar', length: 100, name: 'last_name', nullable: true })
  lastName?: string | null;

  @Column({ type: 'varchar', length: 200, name: 'display_name', nullable: true })
  displayName?: string | null;

  @Column({ type: 'varchar', length: 20, name: 'mobile_number', nullable: true })
  mobileNumber?: string | null;

  @Column({ type: 'date', name: 'date_of_birth', nullable: true })
  dateOfBirth?: Date | string | null;

  @Column({ type: 'text', name: 'avatar_url', nullable: true })
  avatarUrl?: string | null;

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


