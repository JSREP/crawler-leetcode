/**
 * URL编码/解码工具函数
 */

/**
 * 将URL编码为Base64格式
 * @param url 要编码的URL
 * @returns 编码后的Base64字符串
 */
export const encodeUrl = (url: string): string => {
  try {
    return btoa(url);
  } catch (e) {
    console.error('URL编码失败:', e);
    return '';
  }
};

/**
 * 将Base64编码解码为URL
 * @param base64 Base64编码的字符串
 * @returns 解码后的URL字符串
 */
export const decodeUrl = (base64: string): string => {
  try {
    return atob(base64);
  } catch (e) {
    console.error('URL解码失败:', e);
    return '';
  }
};

/**
 * 检查URL是否已经是Base64编码
 * @param url 要检查的URL
 * @returns 是否为Base64编码
 */
export const isBase64Encoded = (url: string): boolean => {
  try {
    // 尝试解码
    const decoded = atob(url);
    // 如果解码成功且结果是以http开头的URL，则说明原字符串很可能是Base64编码
    return decoded.startsWith('http');
  } catch (e) {
    // 解码失败，说明不是Base64
    return false;
  }
};

/**
 * 确保URL是Base64编码的形式
 * @param url 原始URL（可能是明文或已编码）
 * @returns Base64编码后的URL
 */
export const ensureBase64Encoded = (url: string): string => {
  if (!url) return '';
  
  // 检查是否已经是Base64编码
  try {
    // 尝试解码，如果成功则说明当前值可能是Base64
    const decoded = atob(url);
    // 解码成功但仍可能是普通文本碰巧能被解码，进一步判断
    if (decoded.startsWith('http')) {
      // 是URL格式，说明已经是Base64编码了
      return url;
    } else if (url.startsWith('http')) {
      // 原始文本是以http开头的URL，需要编码
      return encodeUrl(url);
    } else {
      // 不确定的情况，返回原值
      return url;
    }
  } catch (e) {
    // 解码失败，说明当前值肯定不是Base64，需要编码
    return encodeUrl(url);
  }
}; 