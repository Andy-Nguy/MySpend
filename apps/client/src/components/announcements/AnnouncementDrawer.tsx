import React from 'react';
import { Button, Drawer, Empty, Spin, Tag } from 'antd';
import { Bell, CheckCheck, Megaphone, Sparkles, Bug, Wrench, Info } from 'lucide-react';
import { AnnouncementTypeEnum, IAnnouncement } from '@myspend/libs';
import {
  useMarkAllAnnouncementsRead,
  useMarkAnnouncementRead,
  useUserAnnouncements,
} from '../../hooks/useAnnouncements';

interface AnnouncementDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const AnnouncementDrawer: React.FC<AnnouncementDrawerProps> = ({
  open,
  onClose,
}) => {
  const { data: announcements, isLoading } = useUserAnnouncements();
  const markReadMutation = useMarkAnnouncementRead();
  const markAllMutation = useMarkAllAnnouncementsRead();

  const unreadCount = announcements?.filter((a) => !a.isRead).length || 0;

  const getTypeTag = (type: AnnouncementTypeEnum) => {
    switch (type) {
      case AnnouncementTypeEnum.FEATURE:
        return (
          <Tag color="success" className="inline-flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3" /> Tính năng
          </Tag>
        );
      case AnnouncementTypeEnum.BUG_FIX:
        return (
          <Tag color="warning" className="inline-flex items-center gap-1 font-medium">
            <Bug className="w-3 h-3" /> Sửa lỗi
          </Tag>
        );
      case AnnouncementTypeEnum.MAINTENANCE:
        return (
          <Tag color="processing" className="inline-flex items-center gap-1 font-medium">
            <Wrench className="w-3 h-3" /> Bảo trì
          </Tag>
        );
      default:
        return (
          <Tag color="default" className="inline-flex items-center gap-1 font-medium">
            <Info className="w-3 h-3" /> Thông báo
          </Tag>
        );
    }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-gray-900">Thông báo & Cập nhật</span>
          {unreadCount > 0 && (
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {unreadCount} mới
            </span>
          )}
        </div>
      }
      placement="right"
      width={440}
      onClose={onClose}
      open={open}
      extra={
        unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={() => markAllMutation.mutate()}
            loading={markAllMutation.isPending}
            className="!text-emerald-700 font-medium inline-flex items-center gap-1 !p-0"
          >
            <CheckCheck className="w-4 h-4" /> Đọc tất cả
          </Button>
        )
      }
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Spin size="default" />
        </div>
      ) : !announcements || announcements.length === 0 ? (
        <div className="py-12">
          <Empty
            description="Chưa có thông báo cập nhật nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item: IAnnouncement) => {
            const formattedDate = item.publishedAt
              ? new Intl.DateTimeFormat('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(new Date(item.publishedAt))
              : '';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  !item.isRead
                    ? 'bg-emerald-50/40 border-emerald-200/90 shadow-sm'
                    : 'bg-white border-gray-200/80 hover:border-gray-300'
                }`}
              >
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {getTypeTag(item.type)}
                  </div>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {item.title}
                </h3>

                {/* Content */}
                <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed mb-3">
                  {item.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                  <span>{formattedDate}</span>
                  {!item.isRead && (
                    <Button
                      type="link"
                      size="small"
                      loading={markReadMutation.isPending && markReadMutation.variables === item.id}
                      onClick={() => markReadMutation.mutate(item.id)}
                      className="!text-emerald-700 hover:!text-emerald-800 font-medium !p-0 !h-auto !text-[11px]"
                    >
                      Đánh dấu đã đọc
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Drawer>
  );
};
