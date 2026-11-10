import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';

import en from './en.json';
import vi from './vi.json';

const STORAGE_KEY = 'myspend_language';

const savedLanguage = localStorage.getItem(STORAGE_KEY) || 'vi';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    lng: savedLanguage,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

// Synchronize dayjs locale with i18n
dayjs.locale(i18n.language === 'en' ? 'en' : 'vi');

i18n.on('languageChanged', (lng) => {
  const normalized = lng.startsWith('en') ? 'en' : 'vi';
  localStorage.setItem(STORAGE_KEY, normalized);
  dayjs.locale(normalized);
  document.documentElement.lang = normalized;
});

export default i18n;
