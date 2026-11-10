import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, type MenuProps } from 'antd';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'vi';

  const items: MenuProps['items'] = [
    {
      key: 'vi',
      label: (
        <div className="flex items-center gap-2 py-1 px-1">
          <span className="text-base leading-none">🇻🇳</span>
          <span className={`text-sm ${currentLang === 'vi' ? 'font-bold text-emerald-700' : 'text-gray-700'}`}>
            Tiếng Việt
          </span>
        </div>
      ),
      onClick: () => i18n.changeLanguage('vi'),
    },
    {
      key: 'en',
      label: (
        <div className="flex items-center gap-2 py-1 px-1">
          <span className="text-base leading-none">🇬🇧</span>
          <span className={`text-sm ${currentLang === 'en' ? 'font-bold text-emerald-700' : 'text-gray-700'}`}>
            English
          </span>
        </div>
      ),
      onClick: () => i18n.changeLanguage('en'),
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <button
        type="button"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200/90 hover:border-emerald-500/40 hover:bg-emerald-50/50 bg-white text-gray-700 transition-all text-xs font-semibold shadow-xs cursor-pointer select-none"
        title="Switch Language / Đổi ngôn ngữ"
      >
        <span className="text-sm leading-none">{currentLang === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
        {!compact && (
          <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">
            {currentLang === 'vi' ? 'VI' : 'EN'}
          </span>
        )}
        <Globe className="w-3.5 h-3.5 text-gray-400" />
      </button>
    </Dropdown>
  );
};
