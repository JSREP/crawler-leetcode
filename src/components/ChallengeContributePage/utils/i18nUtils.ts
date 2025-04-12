import { i18n } from 'i18next';

/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param i18nInstance i18next实例
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date | number, i18nInstance: i18n): string => {
  const dateObj = typeof date === 'number' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return dateObj.toLocaleString(i18nInstance.language, options);
};

/**
 * 格式化数字
 * @param num 数字
 * @param i18nInstance i18next实例
 * @returns 格式化后的数字字符串
 */
export const formatNumber = (num: number, i18nInstance: i18n): string => {
  return new Intl.NumberFormat(i18nInstance.language).format(num);
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param i18nInstance i18next实例
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number, i18nInstance: i18n): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * 格式化持续时间
 * @param milliseconds 毫秒数
 * @param i18nInstance i18next实例
 * @returns 格式化后的持续时间字符串
 */
export const formatDuration = (milliseconds: number, i18nInstance: i18n): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  const parts = [];
  
  if (days > 0) {
    parts.push(`${days}${i18nInstance.t('time.days')}`);
  }
  if (hours % 24 > 0) {
    parts.push(`${hours % 24}${i18nInstance.t('time.hours')}`);
  }
  if (minutes % 60 > 0) {
    parts.push(`${minutes % 60}${i18nInstance.t('time.minutes')}`);
  }
  if (seconds % 60 > 0) {
    parts.push(`${seconds % 60}${i18nInstance.t('time.seconds')}`);
  }
  
  return parts.join(' ');
};

/**
 * 格式化相对时间
 * @param date 日期对象或时间戳
 * @param i18nInstance i18next实例
 * @returns 格式化后的相对时间字符串
 */
export const formatRelativeTime = (date: Date | number, i18nInstance: i18n): string => {
  const dateObj = typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return i18nInstance.t('time.justNow');
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return i18nInstance.t('time.minutesAgo', { count: diffInMinutes });
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return i18nInstance.t('time.hoursAgo', { count: diffInHours });
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return i18nInstance.t('time.daysAgo', { count: diffInDays });
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return i18nInstance.t('time.monthsAgo', { count: diffInMonths });
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return i18nInstance.t('time.yearsAgo', { count: diffInYears });
}; 