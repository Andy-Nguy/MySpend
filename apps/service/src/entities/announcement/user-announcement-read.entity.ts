import { IUserAnnouncementRead } from '@myspend/libs';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ProfileEntity } from '../profile/profile.entity';
import { AnnouncementEntity } from './announcement.entity';

@Entity({ name: 'user_announcement_reads' })
@Unique('UQ_user_announcement_reads', ['userId', 'announcementId'])
export class UserAnnouncementReadEntity implements IUserAnnouncementRead {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Index('IDX_user_announcement_reads_user')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'announcement_id' })
  announcementId!: string;

  @CreateDateColumn({ name: 'read_at', type: 'timestamptz' })
  readAt!: Date;

  @ManyToOne(() => ProfileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: ProfileEntity;

  @ManyToOne(() => AnnouncementEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'announcement_id' })
  announcement?: AnnouncementEntity;
}
