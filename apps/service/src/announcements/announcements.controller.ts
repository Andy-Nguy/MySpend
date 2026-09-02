import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiRoutesEnum } from '@myspend/libs';
import { AnnouncementsService } from './announcements.service';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  async getAnnouncements(@Req() req: { user: { userId: string } }) {
    return this.announcementsService.getUserAnnouncements(req.user.userId);
  }

  @Get('unread')
  async getUnreadSummary(@Req() req: { user: { userId: string } }) {
    return this.announcementsService.getUnreadSummary(req.user.userId);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string
  ) {
    return this.announcementsService.markAsRead(req.user.userId, id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Req() req: { user: { userId: string } }) {
    return this.announcementsService.markAllAsRead(req.user.userId);
  }
}
