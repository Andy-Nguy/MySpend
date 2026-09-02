import {
  AnnouncementPriorityEnum,
  AnnouncementTypeEnum,
  IAnnouncement,
} from '@myspend/libs';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'announcements' })
export class AnnouncementEntity implements IAnnouncement {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'varchar', length: 255, name: 'title' })
  title!: string;

  @Column({ type: 'varchar', length: 50, name: 'version', nullable: true })
  version?: string | null;

  @Column({
    type: 'enum',
    enum: AnnouncementTypeEnum,
    enumName: 'announcement_type_enum',
    name: 'type',
    default: AnnouncementTypeEnum.FEATURE,
  })
  type!: AnnouncementTypeEnum;

  @Column({
    type: 'enum',
    enum: AnnouncementPriorityEnum,
    enumName: 'announcement_priority_enum',
    name: 'priority',
    default: AnnouncementPriorityEnum.MEDIUM,
  })
  priority!: AnnouncementPriorityEnum;

  @Column({ type: 'text', name: 'content' })
  content!: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', name: 'is_popup', default: true })
  isPopup!: boolean;

  @Column({ name: 'published_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  publishedAt!: Date;

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
