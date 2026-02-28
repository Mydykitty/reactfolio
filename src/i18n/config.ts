import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zh from './locales/zh.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)  // 自动检测语言
  .use(initReactI18next)  // 绑定 react
  .init({
    resources: {
      zh: { translation: zh },
      en: { translation: en }
    },
    fallbackLng: 'zh',     // 默认中文
    interpolation: {
      escapeValue: false   // React 已经安全
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;