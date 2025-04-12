/**
 * 创建类型安全的翻译键对象
 * @param keys 翻译键对象
 * @returns 相同结构的翻译键对象，但每个值都是它的键路径
 */
export function createTranslationKeys<T extends Record<string, any>>(
  keys: T,
  prefix: string = ''
): T {
  const result: any = {};

  for (const [key, value] of Object.entries(keys)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      result[key] = createTranslationKeys(value, currentPath);
    } else {
      result[key] = currentPath;
    }
  }

  return result;
} 