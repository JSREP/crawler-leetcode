import { useEffect, useCallback } from 'react';

type EventHandler<T = any> = (event: CustomEvent<T>) => void;

/**
 * 自定义 Hook，用于管理全局事件监听
 * @param eventName 要监听的事件名
 * @param handler 事件处理函数
 * @param dependencies 依赖项数组，用于优化 useEffect 的调用
 */
export function useEventListener<T = any>(
  eventName: string, 
  handler: EventHandler<T>, 
  dependencies: any[] = []
): void {
  // 包装处理函数，确保引用稳定性
  const stableHandler = useCallback(handler, dependencies);

  useEffect(() => {
    // 添加事件监听
    window.addEventListener(eventName, stableHandler as EventListener);
    
    // 清理函数，移除事件监听
    return () => {
      window.removeEventListener(eventName, stableHandler as EventListener);
    };
  }, [eventName, stableHandler]);
}

/**
 * 触发自定义事件
 * @param eventName 要触发的事件名
 * @param detail 事件附带的数据
 */
export function dispatchCustomEvent<T = any>(eventName: string, detail?: T): void {
  const event = new CustomEvent(eventName, { detail });
  window.dispatchEvent(event);
}

/**
 * 表单值更新事件常量
 */
export const FORM_VALUE_UPDATED = 'form-value-updated';

/**
 * 标签更新事件常量
 */
export const TAGS_UPDATED = 'tags-updated';

/**
 * Base64 URL 更新事件常量
 */
export const BASE64_URL_UPDATED = 'base64-url-updated';

/**
 * 触发表单值更新事件
 */
export function dispatchFormValueUpdated(): void {
  dispatchCustomEvent(FORM_VALUE_UPDATED);
}

/**
 * 触发标签更新事件
 * @param tags 更新后的标签数组
 */
export function dispatchTagsUpdated(tags: string[]): void {
  dispatchCustomEvent(TAGS_UPDATED, { tags });
}

/**
 * 触发 Base64 URL 更新事件
 * @param base64Url 更新后的 Base64 URL
 */
export function dispatchBase64UrlUpdated(base64Url: string): void {
  dispatchCustomEvent(BASE64_URL_UPDATED, { base64Url });
} 