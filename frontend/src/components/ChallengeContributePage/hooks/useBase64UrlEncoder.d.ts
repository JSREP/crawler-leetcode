/**
 * Base64 URL编码器Hook的类型声明
 */
export interface Base64UrlEncoder {
  /**
   * 将URL编码为Base64格式
   * @param url 明文URL
   * @returns base64编码的URL
   */
  encodeUrl: (url: string) => string;
  
  /**
   * 将Base64编码解码为明文URL
   * @param base64 Base64编码的URL
   * @returns 解码后的明文URL
   */
  decodeUrl: (base64: string) => string;
  
  /**
   * 确保值是base64格式
   * @param value 要检查的值
   * @returns 始终返回base64格式的值
   */
  ensureBase64Format: (value: string) => string;

  /**
   * 检查URL是否已经是Base64编码
   * @param url 要检查的URL
   * @returns 是否为Base64编码
   */
  isBase64Encoded: (url: string) => boolean;
}

/**
 * Base64 URL编码器Hook
 * 提供URL编码和解码功能
 */
export function useBase64UrlEncoder(): Base64UrlEncoder;

/**
 * 将URL编码为Base64格式
 * @param url 明文URL
 * @returns base64编码的URL
 */
export function encodeUrl(url: string): string;

/**
 * 将Base64编码解码为明文URL
 * @param base64 Base64编码的URL
 * @returns 解码后的明文URL
 */
export function decodeUrl(base64: string): string;

/**
 * 检查URL是否已经是Base64编码
 * @param url 要检查的URL
 * @returns 是否为Base64编码
 */
export function isBase64Encoded(url: string): boolean;

/**
 * 确保URL是Base64编码的形式
 * @param url 原始URL（可能是明文或已编码）
 * @param encodeFunc 用于编码的函数
 * @returns Base64编码后的URL
 */
export function ensureBase64Format(url: string, encodeFunc: (url: string) => string): string; 