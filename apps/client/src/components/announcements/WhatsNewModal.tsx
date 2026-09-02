import React, { useEffect, useState } from 'react';
import { Button, Modal, Tag } from 'antd';
import { Sparkles, Megaphone, Wrench, Bug, Check, Info } from 'lucide-react';
import { AnnouncementPriorityEnum, AnnouncementTypeEnum, IAnnouncement } from '@myspend/libs';
import { useMarkAnnouncementRead, useUnreadAnnouncements } from '../../hooks/useAnnouncements';

export const WhatsNewModal: React.FC = () => {
  const { data: unreadData } = useUnreadAnnouncements();
  const markReadMutation = useMarkAnnouncementRead();
  const [visible, setVisible] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState<IAnnouncement | null>(null);

  useEffect(() => {
    if (unreadData?.latestPopupAnnouncement) {
      setActiveAnnouncement(unreadData.latestPopupAnnouncement);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [unreadData]);

  const handleClose = async () => {
    if (activeAnnouncement) {
      setVisible(false);
      await markReadMutation.mutateAsync(activeAnnouncement.id);
      setActiveAnnouncement(null);
    } else {
      setVisible(false);
    }
  };

  if (!activeAnnouncement) {
    return null;
  }

  const getTypeTag = (type: AnnouncementTypeEnum) => {
    switch (type) {
      case AnnouncementTypeEnum.FEATURE:
        return (
          <Tag color="success" className="flex items-center gap-1 font-medium px-2 py-0.5">
            <Sparkles className="w-3 h-3" /> Tính năng mới
          </Tag>
        );
      case AnnouncementTypeEnum.BUG_FIX:
        return (
          <Tag color="warning" className="flex items-center gap-1 font-medium px-2 py-0.5">
            <Bug className="w-3 h-3" /> Sửa lỗi
          </Tag>
        );
      case AnnouncementTypeEnum.MAINTENANCE:
        return (
          <Tag color="processing" className="flex items-center gap-1 font-medium px-2 py-0.5">
            <Wrench className="w-3 h-3" /> Bảo trì
          </Tag>
        );
      default:
        return (
          <Tag color="default" className="flex items-center gap-1 font-medium px-2 py-0.5">
            <Info className="w-3 h-3" /> Thông báo chung
          </Tag>
        );
    }
  };

  const formattedDate = activeAnnouncement.publishedAt
    ? new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(activeAnnouncement.publishedAt))
    : '';

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      centered
      width={520}
      className="whats-new-modal"
      bodyStyle={{ padding: 0 }}
      closable={true}
    >
      <div className="p-6">
        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 flex-shrink-0">
            <Megaphone className="w-6 h-6 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {getTypeTag(activeAnnouncement.type)}
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-1 line-clamp-2">
              {activeAnnouncement.title}
            </h2>
          </div>
        </div>

        {/* Date line */}
        {formattedDate && (
          <p className="text-xs text-gray-400 mb-4">
            Ngày phát hành: {formattedDate}
          </p>
        )}

        {/* Content Box */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap font-sans">
          {activeAnnouncement.content}
        </div>

        {/* Footer Action */}
        <div className="mt-6 flex justify-end">
          <Button
            type="primary"
            size="large"
            onClick={handleClose}
            loading={markReadMutation.isPending}
            className="w-full sm:w-auto !bg-emerald-700 hover:!bg-emerald-800 !h-10 !px-8 font-semibold shadow-md shadow-emerald-700/20"
            icon={<Check className="w-4 h-4" />}
          >
            Đã hiểu & Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
