import { useCallback } from 'react';

/**
 * 将URL编码为Base64格式
 * @param url 要编码的URL
 * @returns 编码后的Base64字符串
 */
const encodeUrlRaw = (url: string): string => {
  try {
    // 确保输入是有效的字符串
    if (!url || typeof url !== 'string') {
      console.error('encodeUrl: 无效的输入:', url);
      throw new Error('无效的输入');
    }
    
    // 去除可能的空白字符
    const trimmedUrl = url.trim();
    
    // 执行编码
    const encoded = btoa(trimmedUrl);
    
    return encoded;
  } catch (e) {
    console.error('URL编码失败:', e, '原始值:', url);
    // 遇到错误时抛出，而不是返回空字符串
    throw new Error(`编码失败: ${e instanceof Error ? e.message : '未知错误'}`);
  }
};

/**
 * 将Base64编码解码为URL
 * @param base64 Base64编码的字符串
 * @returns 解码后的URL字符串
 */
const decodeUrlRaw = (base64: string): string => {
  try {
    // 如果已经是明文URL，直接返回
    if (base64.startsWith('http')) {
      return base64;
    }
    
    // 确保输入是有效的字符串
    if (!base64 || typeof base64 !== 'string') {
      throw new Error('无效的输入');
    }
    
    // 去除可能的空白字符
    const trimmedBase64 = base64.trim();
    
    // 执行解码
    const decoded = atob(trimmedBase64);
    
    // 验证解码结果是否是URL
    if (!decoded.startsWith('http')) {
      console.warn('decodeUrl: 解码结果不是有效的URL:', decoded);
    }
    
    return decoded;
  } catch (e) {
    console.error('URL解码失败:', e, '原始值:', base64);
    throw new Error(`解码失败: ${e instanceof Error ? e.message : '未知错误'}`);
  }
};

/**
 * 检查URL是否已经是Base64编码
 * @param url 要检查的URL
 * @returns 是否为Base64编码
 */
const isBase64Encoded = (url: string): boolean => {
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
const ensureBase64FormatRaw = (url: string, encodeFunc: (u: string) => string): string => {
  if (!url) return '';
  
  // 如果输入是明文URL，直接编码
  if (url.startsWith('http')) {
    try {
      return encodeFunc(url);
    } catch (e) {
      console.error('编码失败:', e);
      // 编码失败也返回原值，避免数据丢失
      return url;
    }
  }
  
  // 检查是否已经是Base64编码
  try {
    // 尝试解码
    const decoded = atob(url);
    
    // 解码成功但仍可能是普通文本碰巧能被解码，进一步判断
    if (decoded.startsWith('http')) {
      // 是URL格式，说明已经是Base64编码了
      return url;
    } else {
      // 解码结果不是URL，可能是原始文本，需要编码
      return encodeFunc(url);
    }
  } catch (e) {
    // 解码失败，说明当前值肯定不是Base64，尝试编码
    try {
      return encodeFunc(url);
    } catch (encodeError) {
      console.error('编码失败:', encodeError);
      // 编码失败也返回原值，避免数据丢失
      return url;
    }
  }
};

/**
 * Base64 URL编码器Hook
 * 提供URL编码和解码功能
 */
export const useBase64UrlEncoder = () => {
  /**
   * 将URL编码为Base64格式
   * @param url 明文URL
   * @returns base64编码的URL
   */
  const encodeUrl = useCallback((url: string): string => {
    try {
      return encodeUrlRaw(url);
    } catch (error) {
      console.error('URL编码失败:', error);
      // 如果编码失败，返回原始值，避免数据丢失
      return url;
    }
  }, []);

  /**
   * 将Base64编码解码为明文URL
   * @param base64 Base64编码的URL
   * @returns 解码后的明文URL
   */
  const decodeUrl = useCallback((base64: string): string => {
    try {
      return decodeUrlRaw(base64);
    } catch (error) {
      console.error('URL解码失败:', error);
      // 如果解码失败，返回原始值，避免数据丢失
      return base64;
    }
  }, []);

  /**
   * 确保值是base64格式
   * @param value 要检查的值
   * @returns 始终返回base64格式的值
   */
  const ensureBase64Format = useCallback((value: string): string => {
    return ensureBase64FormatRaw(value, encodeUrl);
  }, [encodeUrl]);

  return {
    encodeUrl,
    decodeUrl,
    ensureBase64Format,
    isBase64Encoded: useCallback(isBase64Encoded, [])
  };
};

// 导出工具函数，以便可以直接使用（非hook方式）
export { encodeUrlRaw as encodeUrl, decodeUrlRaw as decodeUrl, isBase64Encoded, ensureBase64FormatRaw as ensureBase64Format }; 