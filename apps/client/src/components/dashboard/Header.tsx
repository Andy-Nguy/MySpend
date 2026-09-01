import React from 'react';
import { Calendar, ChevronDown, LogOut, Plus, User, Wallet } from 'lucide-react';
import { Dropdown, MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../../consts/routes';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenAddTransaction: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddTransaction }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName =
    user?.displayName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null) ||
    user?.email?.split('@')[0] ||
    'User';

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
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left Brand Identity */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-emerald-500 flex items-center justify-center shadow-md shadow-emerald-700/20 text-white">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                  MySpend
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Personal
                </span>
              </div>
              <p className="hidden sm:block text-xs font-medium text-gray-400">
                Smart Expense &amp; Budget Tracker
              </p>
            </div>
          </div>

          {/* Right Action & Profile Area */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Current Month Badge (Desktop/Tablet) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200/80 text-gray-700 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentDate}</span>
            </div>

            {/* Quick Add Action Button */}
            <button
              type="button"
              onClick={onOpenAddTransaction}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-700/25 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Transaction</span>
            </button>

            {/* User Profile Dropdown */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
              getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
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

