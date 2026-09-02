import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementEntity } from '../entities/announcement/announcement.entity';
import { UserAnnouncementReadEntity } from '../entities/announcement/user-announcement-read.entity';
import { ProfilesModule } from '../profiles/profiles.module';
import { AnnouncementsController } from './announcements.controller';
import { AdminAnnouncementsController } from './admin-announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsRepository } from './repository/announcements.repository';
import { UserAnnouncementReadsRepository } from './repository/user-announcement-reads.repository';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnnouncementEntity, UserAnnouncementReadEntity]),
    ProfilesModule,
  ],
  controllers: [AnnouncementsController, AdminAnnouncementsController],
  providers: [
    AnnouncementsService,
    AnnouncementsRepository,
    UserAnnouncementReadsRepository,
    PermissionsGuard,
  ],
  exports: [AnnouncementsService],
})
export class AnnouncementsModule {}
