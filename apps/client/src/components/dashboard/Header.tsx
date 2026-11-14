import React from 'react';
import { Calendar, ChevronDown, LogOut, Megaphone, Plus, User, Wallet } from 'lucide-react';
import { Dropdown, MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { PermissionNameEnum } from '@myspend/libs';
import { AppRoutes } from '../../consts/routes';
import { useAuth } from '../../context/AuthContext';
import { AnnouncementBell } from '../announcements/AnnouncementBell';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

interface HeaderProps {
  onOpenAddTransaction: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddTransaction }) => {
  const { t, i18n } = useTranslation();
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
          <p className="text-xs text-gray-500 font-normal">
            {i18n.language.startsWith('vi') ? 'Đăng nhập với tư cách' : 'Signed in as'}
          </p>
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
      label: t('nav.profile'),
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
            label: t('nav.adminAnnouncements'),
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
      label: t('nav.logout'),
      onClick: () => logout(),
    },
  ];

  const currentDate = dayjs().format(t('dashboard.monthFormat'));

  return (
    <header className="sticky top-0 z-30 bg-[#f4fbf4]/85 backdrop-blur-xl border-b border-[#bbcabf]/40 shadow-[0_1px_8px_rgba(0,0,0,0.03)] transition-all w-full">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[72px] gap-2">
          {/* Left Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
            <div
              onClick={() => navigate(AppRoutes.HOME)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#006c49] flex items-center justify-center shadow-[0_4px_16px_rgba(0,108,73,0.22)] text-white flex-shrink-0 cursor-pointer"
            >
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  onClick={() => navigate(AppRoutes.HOME)}
                  className="text-lg sm:text-xl font-bold tracking-tight text-[#161d19] cursor-pointer whitespace-nowrap"
                >
                  MySpend
                </span>
                <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e8f0e9] text-[#006c49] flex-shrink-0">
                  Personal
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#eef6ee] p-1 rounded-2xl shrink-0">
            <button
              onClick={() => navigate(AppRoutes.HOME)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                location.pathname === AppRoutes.HOME
                  ? 'bg-[#e3eae3] text-[#161d19] shadow-sm'
                  : 'text-[#3c4a42] hover:text-[#161d19] hover:bg-[#e3eae3]/60'
              }`}
            >
              {t('nav.dashboard')}
            </button>
            <button
              onClick={() => navigate(AppRoutes.CATEGORIES)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                location.pathname === AppRoutes.CATEGORIES
                  ? 'bg-[#e3eae3] text-[#161d19] shadow-sm'
                  : 'text-[#3c4a42] hover:text-[#161d19] hover:bg-[#e3eae3]/60'
              }`}
            >
              {t('nav.categories')}
            </button>
            <button
              onClick={() => navigate(AppRoutes.TRANSACTIONS)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                location.pathname === AppRoutes.TRANSACTIONS
                  ? 'bg-[#e3eae3] text-[#161d19] shadow-sm'
                  : 'text-[#3c4a42] hover:text-[#161d19] hover:bg-[#e3eae3]/60'
              }`}
            >
              {t('nav.transactions')}
            </button>
            <button
              onClick={() => navigate(AppRoutes.REPORTS)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                location.pathname === AppRoutes.REPORTS
                  ? 'bg-[#e3eae3] text-[#161d19] shadow-sm'
                  : 'text-[#3c4a42] hover:text-[#161d19] hover:bg-[#e3eae3]/60'
              }`}
            >
              {t('nav.reports')}
            </button>
          </nav>

          {/* Right Action & Profile Area */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Current Month Badge (Large Desktop) */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] text-[#161d19] text-xs font-medium capitalize whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-[#006c49]" />
              <span>{currentDate}</span>
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Notification Bell */}
            <AnnouncementBell />

            {/* Quick Add Action Button – icon-only on very small screens */}
            <button
              type="button"
              onClick={onOpenAddTransaction}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#10b981] hover:bg-[#006c49] text-[#00422b] hover:text-white text-xs sm:text-sm font-semibold shadow-[0_4px_16px_rgba(16,185,129,0.25)] transition-all duration-200 focus:outline-none whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t('dashboard.addTransaction')}</span>
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
