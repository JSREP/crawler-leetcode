import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en';
import zhTranslations from './locales/zh';

// 获取用户的语言偏好
const getUserLanguagePreference = () => {
  // 首先检查本地存储中是否有用户选择的语言
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    return savedLanguage;
  }
  
  // 如果没有存储的语言偏好，则检测浏览器语言
  const browserLang = navigator.language || (navigator as any).userLanguage;
  
  // 只支持中文和英文，将浏览器语言匹配到支持的语言
  if (browserLang.startsWith('zh')) {
    return 'zh';
  }
  
  // 默认返回英文
  return 'en';
};

i18n
  .use(LanguageDetector) // 添加语言检测器
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      zh: {
        translation: zhTranslations
      }
    },
    lng: getUserLanguagePreference(),
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false
    }
  });

export const changeLanguage = (language: string) => {
  localStorage.setItem('language', language);
  i18n.changeLanguage(language);
};

export default i18n;