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
    console.log('从localStorage获取到语言偏好:', savedLanguage);
    return savedLanguage;
  }
  
  // 如果没有存储的语言偏好，则检测浏览器语言
  const browserLang = navigator.language || (navigator as any).userLanguage;
  console.log('从浏览器获取到语言偏好:', browserLang);
  
  // 只支持中文和英文，将浏览器语言匹配到支持的语言
  if (browserLang.startsWith('zh')) {
    console.log('使用中文作为默认语言');
    return 'zh';
  }
  
  // 默认返回英文
  console.log('使用英文作为默认语言');
  return 'en';
};

const initialLanguage = getUserLanguagePreference();
console.log('初始化i18n，初始语言:', initialLanguage);

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
    lng: initialLanguage,
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
  console.log('正在切换语言到:', language);
  localStorage.setItem('language', language);
  i18n.changeLanguage(language).then(() => {
    console.log('语言切换成功，当前语言:', i18n.language);
  });
};

export default i18n;