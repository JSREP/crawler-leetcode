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
    // 确保输入是有效的字符串
    if (!url || typeof url !== 'string') {
      console.error('encodeUrl: 无效的输入:', url);
      throw new Error('无效的输入');
    }
    
    // 去除可能的空白字符
    const trimmedUrl = url.trim();
    console.log('encodeUrl: 尝试编码:', trimmedUrl);
    
    // 执行编码
    const encoded = btoa(trimmedUrl);
    console.log('encodeUrl: 编码结果:', encoded);
    
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
export const decodeUrl = (base64: string): string => {
  try {
    // 如果已经是明文URL，直接返回
    if (base64.startsWith('http')) {
      console.log('decodeUrl: 输入值已经是明文URL, 直接返回:', base64);
      return base64;
    }
    
    // 确保输入是有效的字符串
    if (!base64 || typeof base64 !== 'string') {
      console.error('decodeUrl: 无效的输入:', base64);
      throw new Error('无效的输入');
    }
    
    // 去除可能的空白字符
    const trimmedBase64 = base64.trim();
    console.log('decodeUrl: 尝试解码:', trimmedBase64);
    
    // 执行解码
    const decoded = atob(trimmedBase64);
    console.log('decodeUrl: 解码结果:', decoded);
    
    // 验证解码结果是否是URL
    if (!decoded.startsWith('http')) {
      console.warn('decodeUrl: 解码结果不是有效的URL:', decoded);
    }
    
    return decoded;
  } catch (e) {
    console.error('URL解码失败:', e, '原始值:', base64);
    // 解码失败时返回空字符串代替原始值，
    // 避免将无效的base64编码当作有效URL处理
    throw new Error(`解码失败: ${e instanceof Error ? e.message : '未知错误'}`);
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
  
  console.log('ensureBase64Encoded: 检查输入:', url);
  
  // 如果输入是明文URL，直接编码
  if (url.startsWith('http')) {
    console.log('ensureBase64Encoded: 输入是明文URL，执行编码');
    try {
      const encoded = encodeUrl(url);
      console.log('ensureBase64Encoded: 编码结果:', encoded);
      return encoded;
    } catch (e) {
      console.error('ensureBase64Encoded: 编码失败:', e);
      // 编码失败也返回原值，避免数据丢失
      return url;
    }
  }
  
  // 检查是否已经是Base64编码
  try {
    // 尝试解码
    const decoded = atob(url);
    console.log('ensureBase64Encoded: 尝试解码成功，结果:', decoded);
    
    // 解码成功但仍可能是普通文本碰巧能被解码，进一步判断
    if (decoded.startsWith('http')) {
      // 是URL格式，说明已经是Base64编码了
      console.log('ensureBase64Encoded: 确认是有效的Base64编码URL');
      return url;
    } else {
      // 解码结果不是URL，可能是原始文本，需要编码
      console.log('ensureBase64Encoded: 解码结果不是URL，需要再次编码');
      return encodeUrl(url);
    }
  } catch (e) {
    // 解码失败，说明当前值肯定不是Base64，尝试编码
    console.log('ensureBase64Encoded: 解码失败，尝试作为普通文本编码');
    try {
      return encodeUrl(url);
    } catch (encodeError) {
      console.error('ensureBase64Encoded: 编码失败:', encodeError);
      // 编码失败也返回原值，避免数据丢失
      return url;
    }
  }
};

/**
 * URL工具函数集
 */

// 定义常见来源的域名映射
export const SOURCE_MAPPING: Record<string, string> = {
  'github.com': 'GitHub',
  'mp.weixin.qq.com': '微信公众号',
  'juejin.cn': '掘金',
  'csdn.net': 'CSDN',
  'zhihu.com': '知乎',
  'segmentfault.com': 'SegmentFault',
  'jianshu.com': '简书',
  'leetcode.cn': 'LeetCode',
  'leetcode.com': 'LeetCode',
  'bilibili.com': 'B站',
  'youtube.com': 'YouTube',
  'blog.csdn.net': 'CSDN',
  'medium.com': 'Medium',
  'dev.to': 'Dev.to',
  'stackoverflow.com': 'Stack Overflow'
};

/**
 * 验证URL是否合法
 * @param url 要验证的URL
 * @returns 是否为有效URL
 */
export const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    // 如果不是标准URL，尝试添加https前缀再验证
    if (!url.startsWith('http')) {
      try {
        new URL(`https://${url}`);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
};

/**
 * 根据URL自动判断来源
 * @param url URL地址
 * @returns 判断出的来源名称
 */
export const getSourceFromUrl = (url: string): string => {
  if (!isValidUrl(url)) return '';
  
  try {
    // 确保URL有协议部分
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(urlWithProtocol);
    const domain = urlObj.hostname.toLowerCase();
    
    // 遍历SOURCE_MAPPING查找匹配的来源
    for (const [key, value] of Object.entries(SOURCE_MAPPING)) {
      if (domain.includes(key)) {
        return value;
      }
    }
    
    // 如果没有匹配的预定义来源，返回域名的首字母大写形式
    return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
  } catch {
    return '';
  }
}; 