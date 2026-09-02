import React from 'react';
import { Calendar, ChevronDown, LogOut, Megaphone, Plus, User, Wallet } from 'lucide-react';
import { Dropdown, MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { PermissionNameEnum } from '@myspend/libs';
import { AppRoutes } from '../../consts/routes';
import { useAuth } from '../../context/AuthContext';
import { AnnouncementBell } from '../announcements/AnnouncementBell';

interface HeaderProps {
  onOpenAddTransaction: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddTransaction }) => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const displayName =
    user?.displayName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null) ||
    user?.email?.split('@')[0] ||
    'User';

  const canManageAnnouncements = hasPermission(PermissionNameEnum.ANNOUNCEMENT_CREATE);

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      disabled: true,
      label: (
        <div className="py-1 px-2">
          <p className="text-xs text-gray-500 font-normal">Signed in as</p>
          <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
            {user?.email}
          </p>
          {canManageAnnouncements && (
            <span className="inline-block mt-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
              ADMIN
            </span>
          )}
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'profile',
      icon: <User className="w-4 h-4 text-emerald-600" />,
      label: 'My Profile',
      onClick: () => navigate(AppRoutes.PROFILE),
    },
    ...(canManageAnnouncements
      ? [
          {
            type: 'divider' as const,
          },
          {
            key: 'admin-announcements',
            icon: <Megaphone className="w-4 h-4 text-emerald-600" />,
            label: 'Quản lý thông báo',
            onClick: () => navigate(AppRoutes.ADMIN_ANNOUNCEMENTS),
          },
        ]
      : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      danger: true,
      icon: <LogOut className="w-4 h-4 text-red-500" />,
      label: 'Sign out',
      onClick: () => logout(),
    },
  ];

  const currentDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 transition-all w-full">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2">
          {/* Left Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-emerald-500 flex items-center justify-center shadow-md shadow-emerald-700/20 text-white flex-shrink-0">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  onClick={() => navigate(AppRoutes.HOME)}
                  className="text-lg sm:text-2xl font-black tracking-tight text-gray-900 cursor-pointer whitespace-nowrap"
                >
                  MySpend
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                  Personal
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl">
            <button
              onClick={() => navigate(AppRoutes.HOME)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                location.pathname === AppRoutes.HOME
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Trang chủ
            </button>
            <button
              onClick={() => navigate(AppRoutes.CATEGORIES)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                location.pathname === AppRoutes.CATEGORIES
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Danh mục
            </button>
            <button
              onClick={() => navigate(AppRoutes.TRANSACTIONS)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                location.pathname === AppRoutes.TRANSACTIONS
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lịch sử
            </button>
            <button
              onClick={() => navigate(AppRoutes.REPORTS)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                location.pathname === AppRoutes.REPORTS
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Báo cáo
            </button>
          </nav>

          {/* Right Action & Profile Area */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Current Month Badge (Desktop/Tablet) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200/80 text-gray-700 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentDate}</span>
            </div>

            {/* Notification Bell */}
            <AnnouncementBell />

            {/* Quick Add Action Button – icon-only on very small screens */}
            <button
              type="button"
              onClick={onOpenAddTransaction}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-700/25 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline sm:inline">Add Transaction</span>
            </button>

            {/* User Profile Dropdown */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <button
                type="button"
                className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-gray-100/80 border border-transparent hover:border-gray-200 transition-colors focus:outline-none"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="w-8 h-8 rounded-lg object-cover border border-emerald-500/20 shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-gray-400" />
              </button>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
};
