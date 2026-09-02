import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { AnnouncementEntity } from '../../entities/announcement/announcement.entity';
import { IAnnouncement } from '@myspend/libs';

@Injectable()
export class AnnouncementsRepository {
  constructor(
    @InjectRepository(AnnouncementEntity)
    private readonly repository: Repository<AnnouncementEntity>
  ) {}

  async findAllForAdmin(): Promise<AnnouncementEntity[]> {
    return this.repository.find({
      order: {
        publishedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findById(id: string): Promise<AnnouncementEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(data: Partial<AnnouncementEntity>): Promise<AnnouncementEntity> {
    const announcement = this.repository.create(data);
    return this.repository.save(announcement);
  }

  async update(id: string, updates: Partial<AnnouncementEntity>): Promise<AnnouncementEntity | null> {
    await this.repository.update({ id }, updates);
    return this.findById(id);
  }

  async softDelete(id: string, deletedBy?: string): Promise<void> {
    await this.repository.update({ id }, {
      deletedAt: new Date(),
      deletedBy: deletedBy || null,
    });
  }

  async findActiveForUser(userId: string): Promise<IAnnouncement[]> {
    const now = new Date();
    const rows = await this.repository
      .createQueryBuilder('a')
      .leftJoin(
        'user_announcement_reads',
        'r',
        'r.announcement_id = a.id AND r.user_id = :userId',
        { userId }
      )
      .where('a.is_active = :isActive', { isActive: true })
      .andWhere('a.published_at <= :now', { now })
      .andWhere('a.deleted_at IS NULL')
      .select([
        'a.id AS id',
        'a.title AS title',
        'a.version AS version',
        'a.type AS type',
        'a.priority AS priority',
        'a.content AS content',
        'a.is_active AS "isActive"',
        'a.is_popup AS "isPopup"',
        'a.published_at AS "publishedAt"',
        'a.created_at AS "createdAt"',
        'a.updated_at AS "updatedAt"',
        'a.deleted_at AS "deletedAt"',
        'CASE WHEN r.id IS NOT NULL THEN true ELSE false END AS "isRead"',
      ])
      .orderBy('a.published_at', 'DESC')
      .addOrderBy('a.created_at', 'DESC')
      .getRawMany();

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      version: row.version,
      type: row.type,
      priority: row.priority,
      content: row.content,
      isActive: row.isActive,
      isPopup: row.isPopup,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
      isRead: Boolean(row.isRead),
    }));
  }

  async findLatestUnreadPopup(userId: string): Promise<IAnnouncement | null> {
    const now = new Date();
    const row = await this.repository
      .createQueryBuilder('a')
      .leftJoin(
        'user_announcement_reads',
        'r',
        'r.announcement_id = a.id AND r.user_id = :userId',
        { userId }
      )
      .where('a.is_active = :isActive', { isActive: true })
      .andWhere('a.is_popup = :isPopup', { isPopup: true })
      .andWhere('a.published_at <= :now', { now })
      .andWhere('a.deleted_at IS NULL')
      .andWhere('r.id IS NULL')
      .select([
        'a.id AS id',
        'a.title AS title',
        'a.version AS version',
        'a.type AS type',
        'a.priority AS priority',
        'a.content AS content',
        'a.is_active AS "isActive"',
        'a.is_popup AS "isPopup"',
        'a.published_at AS "publishedAt"',
        'a.created_at AS "createdAt"',
        'a.updated_at AS "updatedAt"',
      ])
      .orderBy('a.published_at', 'DESC')
      .addOrderBy('a.created_at', 'DESC')
      .getRawOne();

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      title: row.title,
      version: row.version,
      type: row.type,
      priority: row.priority,
      content: row.content,
      isActive: row.isActive,
      isPopup: row.isPopup,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      isRead: false,
    };
  }

  async getActiveCount(userId: string): Promise<number> {
    const now = new Date();
    return this.repository
      .createQueryBuilder('a')
      .leftJoin(
        'user_announcement_reads',
        'r',
        'r.announcement_id = a.id AND r.user_id = :userId',
        { userId }
      )
      .where('a.is_active = :isActive', { isActive: true })
      .andWhere('a.published_at <= :now', { now })
      .andWhere('a.deleted_at IS NULL')
      .andWhere('r.id IS NULL')
      .getCount();
  }
}
