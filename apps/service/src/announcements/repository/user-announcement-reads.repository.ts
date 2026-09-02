import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAnnouncementReadEntity } from '../../entities/announcement/user-announcement-read.entity';

@Injectable()
export class UserAnnouncementReadsRepository {
  constructor(
    @InjectRepository(UserAnnouncementReadEntity)
    private readonly repository: Repository<UserAnnouncementReadEntity>
  ) {}

  async markAsRead(userId: string, announcementId: string): Promise<UserAnnouncementReadEntity> {
    const existing = await this.repository.findOne({
      where: { userId, announcementId },
    });

    if (existing) {
      return existing;
    }

    const record = this.repository.create({
      userId,
      announcementId,
    });

    return this.repository.save(record);
  }

  async markAllAsRead(userId: string, announcementIds: string[]): Promise<void> {
    if (announcementIds.length === 0) return;

    for (const announcementId of announcementIds) {
      await this.markAsRead(userId, announcementId);
    }
  }

  async hasRead(userId: string, announcementId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { userId, announcementId },
    });
    return count > 0;
  }
}
