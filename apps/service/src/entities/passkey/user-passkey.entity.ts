import { IUserPasskey } from '@myspend/libs';
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
import { ProfileEntity } from '../profile/profile.entity';

@Entity({ name: 'user_passkeys' })
export class UserPasskeyEntity implements IUserPasskey {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => ProfileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: ProfileEntity;

  @Column({ type: 'text', name: 'credential_id', unique: true })
  credentialId!: string;

  @Column({ type: 'text', name: 'public_key' })
  publicKey!: string;

  @Column({
    type: 'bigint',
    name: 'counter',
    default: 0,
    transformer: {
      from: (v: string | number) => Number(v),
      to: (v: number) => v,
    },
  })
  counter!: number;

  @Column({ type: 'varchar', length: 50, name: 'device_type', nullable: true })
  deviceType?: string | null;

  @Column({ type: 'boolean', name: 'backed_up', default: false })
  backedUp?: boolean;

  @Column({ type: 'text', array: true, name: 'transports', nullable: true })
  transports?: string[] | null;

  @Column({ type: 'varchar', length: 150, name: 'device_name', nullable: true })
  deviceName?: string | null;

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
