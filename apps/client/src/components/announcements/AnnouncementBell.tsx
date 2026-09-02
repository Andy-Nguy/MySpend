import React, { useState } from 'react';
import { Badge } from 'antd';
import { Bell } from 'lucide-react';
import { useUnreadAnnouncements } from '../../hooks/useAnnouncements';
import { AnnouncementDrawer } from './AnnouncementDrawer';

export const AnnouncementBell: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: unreadData } = useUnreadAnnouncements();

  const unreadCount = unreadData?.unreadCount || 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 border border-transparent hover:border-gray-200 transition-all focus:outline-none flex items-center justify-center"
        aria-label="Thông báo cập nhật"
      >
        <Badge
          count={unreadCount}
          size="small"
          offset={[2, -2]}
          styles={{
            indicator: {
              backgroundColor: '#047857',
              fontSize: '10px',
              height: '16px',
              minWidth: '16px',
              lineHeight: '16px',
            },
          }}
        >
          <Bell className="w-5 h-5" />
        </Badge>
      </button>

      <AnnouncementDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};
