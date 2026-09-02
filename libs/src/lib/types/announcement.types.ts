import { IBaseEntity } from './base.types';
import { AnnouncementTypeEnum } from '../enums/announcement-type.enum';
import { AnnouncementPriorityEnum } from '../enums/announcement-priority.enum';

export interface IAnnouncement extends IBaseEntity {
  id: string;
  title: string;
  version?: string | null;
  type: AnnouncementTypeEnum;
  priority: AnnouncementPriorityEnum;
  content: string;
  isActive: boolean;
  isPopup: boolean;
  publishedAt: Date | string;
  isRead?: boolean;
}

export interface IUserAnnouncementRead {
  id: string;
  userId: string;
  announcementId: string;
  readAt: Date | string;
}

export interface ICreateAnnouncementDto {
  title: string;
  version?: string;
  type?: AnnouncementTypeEnum;
  priority?: AnnouncementPriorityEnum;
  content: string;
  isActive?: boolean;
  isPopup?: boolean;
  publishedAt?: Date | string;
}

export interface IUpdateAnnouncementDto extends Partial<ICreateAnnouncementDto> {}

export interface IAnnouncementUnreadResponse {
  unreadCount: number;
  latestPopupAnnouncement: IAnnouncement | null;
  announcements: IAnnouncement[];
}
