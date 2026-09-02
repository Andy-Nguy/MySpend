import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IAnnouncement, IAnnouncementUnreadResponse } from '@myspend/libs';
import { AnnouncementsRepository } from './repository/announcements.repository';
import { UserAnnouncementReadsRepository } from './repository/user-announcement-reads.repository';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { AnnouncementEntity } from '../entities/announcement/announcement.entity';

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(
    private readonly announcementsRepository: AnnouncementsRepository,
    private readonly userAnnouncementReadsRepository: UserAnnouncementReadsRepository,
  ) {}

  // ===========================================================================
  // User Operations
  // ===========================================================================

  async getUserAnnouncements(userId: string): Promise<IAnnouncement[]> {
    return this.announcementsRepository.findActiveForUser(userId);
  }

  async getUnreadSummary(userId: string): Promise<IAnnouncementUnreadResponse> {
    const [announcements, latestPopupAnnouncement, unreadCount] =
      await Promise.all([
        this.announcementsRepository.findActiveForUser(userId),
        this.announcementsRepository.findLatestUnreadPopup(userId),
        this.announcementsRepository.getActiveCount(userId),
      ]);

    return {
      unreadCount,
      latestPopupAnnouncement,
      announcements,
    };
  }

  async markAsRead(
    userId: string,
    announcementId: string,
  ): Promise<{ success: boolean }> {
    const announcement =
      await this.announcementsRepository.findById(announcementId);
    if (!announcement || announcement.deletedAt) {
      throw new NotFoundException('Announcement not found');
    }

    await this.userAnnouncementReadsRepository.markAsRead(
      userId,
      announcementId,
    );
    this.logger.log(
      `Marked announcement ${announcementId} as read by user ${userId}`,
    );
    return { success: true };
  }

  async markAllAsRead(userId: string): Promise<{ success: boolean }> {
    const activeAnnouncements =
      await this.announcementsRepository.findActiveForUser(userId);
    const unreadIds = activeAnnouncements
      .filter((a) => !a.isRead)
      .map((a) => a.id);

    await this.userAnnouncementReadsRepository.markAllAsRead(userId, unreadIds);
    this.logger.log(
      `Marked all announcements (${unreadIds.length}) as read by user ${userId}`,
    );
    return { success: true };
  }

  // ===========================================================================
  // Admin Operations (Protected by PermissionsGuard)
  // ===========================================================================

  async getAdminAnnouncements(): Promise<AnnouncementEntity[]> {
    return this.announcementsRepository.findAllForAdmin();
  }

  async getAdminAnnouncementById(id: string): Promise<AnnouncementEntity> {
    const announcement = await this.announcementsRepository.findById(id);
    if (!announcement || announcement.deletedAt) {
      throw new NotFoundException('Announcement not found');
    }
    return announcement;
  }

  async createAnnouncement(
    dto: CreateAnnouncementDto,
    adminId: string,
  ): Promise<AnnouncementEntity> {
    const publishedAt = dto.publishedAt
      ? new Date(dto.publishedAt)
      : new Date();

    const created = await this.announcementsRepository.create({
      title: dto.title.trim(),
      version: dto.version?.trim() || null,
      type: dto.type,
      priority: dto.priority,
      content: dto.content,
      isActive: dto.isActive ?? true,
      isPopup: dto.isPopup ?? true,
      publishedAt,
      createdBy: adminId,
    });

    this.logger.log(
      ` [Admin] Created announcement: "${created.title}" (version: ${created.version || 'none'}) by admin ${adminId}`,
    );
    return created;
  }

  async updateAnnouncement(
    id: string,
    dto: UpdateAnnouncementDto,
    adminId: string,
  ): Promise<AnnouncementEntity> {
    const existing = await this.getAdminAnnouncementById(id);

    const updates: Partial<AnnouncementEntity> = {
      updatedBy: adminId,
    };

    if (dto.title !== undefined) updates.title = dto.title.trim();
    if (dto.version !== undefined)
      updates.version = dto.version?.trim() || null;
    if (dto.type !== undefined) updates.type = dto.type;
    if (dto.priority !== undefined) updates.priority = dto.priority;
    if (dto.content !== undefined) updates.content = dto.content;
    if (dto.isActive !== undefined) updates.isActive = dto.isActive;
    if (dto.isPopup !== undefined) updates.isPopup = dto.isPopup;
    if (dto.publishedAt !== undefined)
      updates.publishedAt = new Date(dto.publishedAt);

    const updated = await this.announcementsRepository.update(id, updates);
    this.logger.log(` [Admin] Updated announcement ${id} by admin ${adminId}`);
    return updated || existing;
  }

  async deleteAnnouncement(
    id: string,
    adminId: string,
  ): Promise<{ success: boolean }> {
    await this.getAdminAnnouncementById(id);
    await this.announcementsRepository.softDelete(id, adminId);
    this.logger.log(
      `🗑️ [Admin] Soft deleted announcement ${id} by admin ${adminId}`,
    );
    return { success: true };
  }

  async toggleActive(id: string, adminId: string): Promise<AnnouncementEntity> {
    const existing = await this.getAdminAnnouncementById(id);
    const updated = await this.announcementsRepository.update(id, {
      isActive: !existing.isActive,
      updatedBy: adminId,
    });
    this.logger.log(
      ` [Admin] Toggled active status for announcement ${id} to ${!existing.isActive} by admin ${adminId}`,
    );
    return updated || existing;
  }
}
