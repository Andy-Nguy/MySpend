import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'passkey_challenges' })
export class PasskeyChallengeEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId?: string | null;

  @Column({ type: 'text', name: 'challenge' })
  challenge!: string;

  @Column({ type: 'varchar', length: 20, name: 'type' })
  type!: 'registration' | 'authentication';

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
