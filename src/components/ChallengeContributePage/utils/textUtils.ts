/**
 * 文本处理工具函数
 */

/**
 * 安全地将任何类型的值转换为字符串
 * 处理null、undefined、对象等各种类型
 * @param value 任意类型的值
 * @returns 转换后的字符串
 */
export const safeToString = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  // 如果已经是字符串类型，直接返回
  if (typeof value === 'string') {
    return value;
  }
  
  // 如果是对象类型
  if (typeof value === 'object') {
    try {
      // 检查是否是编辑器的特定数据格式
      if (value.text && typeof value.text === 'string') {
        return value.text;
      }
      
      // 检查是否包含html或markdown属性（有些编辑器组件可能使用这种结构）
      if (value.markdown && typeof value.markdown === 'string') {
        return value.markdown;
      }
      if (value.html && typeof value.html === 'string') {
        return value.html;
      }
      
      // 检查是否有特定的数据结构
      if (value.content && typeof value.content === 'string') {
        return value.content;
      }
      
      // 检查是否有toString方法且不是默认的Object.toString
      if (value.toString && typeof value.toString === 'function' && value.toString() !== '[object Object]') {
        return value.toString();
      }
      
      // 最后尝试JSON序列化，但忽略循环引用的对象
      try {
        const jsonStr = JSON.stringify(value);
        return jsonStr === '{}' ? '' : jsonStr;
      } catch (jsonError) {
        console.warn('无法将对象转换为JSON字符串:', jsonError);
        return '';
      }
    } catch (e) {
      console.error('无法将对象转换为字符串', e);
      return '';
    }
  }
  
  // 基本类型直接转字符串
  return String(value);
};

/**
 * 检查字符串是否为"[object Object]"
 * @param text 要检查的字符串
 * @returns 是否为无效对象文本
 */
export const isInvalidObjectString = (text: string): boolean => {
  return text === '[object Object]';
};

/**
 * 安全地获取字符串长度，处理null和undefined
 * @param text 要获取长度的字符串
 * @returns 字符串长度
 */
export const safeStringLength = (text: any): number => {
  const str = safeToString(text);
  return str.length;
}; 