/**
 * 图片上传到Vercel Blob Store的工具函数
 */

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
}

/**
 * 上传图片到Blob Store
 */
export async function uploadImageToBlob(
  file: File,
  category: string = 'general'
): Promise<UploadResult> {
  try {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      throw new Error('只支持图片文件');
    }

    // 验证文件大小 (最大5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('图片文件大小不能超过5MB');
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomId}.${extension}`;

    // 构建上传URL
    const uploadUrl = `/api/upload?filename=${encodeURIComponent(filename)}&category=${category}&type=image`;

    // 创建FormData
    const formData = new FormData();
    formData.append('file', file);

    // 上传文件
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '上传失败');
    }

    const result = await response.json();

    return {
      url: result.url,
      filename: result.filename || filename,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

/**
 * 批量上传图片
 */
export async function uploadMultipleImages(
  files: File[],
  category: string = 'general'
): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadImageToBlob(file, category));
  return Promise.all(uploadPromises);
}

/**
 * 从剪贴板上传图片
 */
export async function uploadFromClipboard(
  clipboardData: DataTransfer,
  category: string = 'general'
): Promise<UploadResult[]> {
  const files: File[] = [];
  
  for (let i = 0; i < clipboardData.items.length; i++) {
    const item = clipboardData.items[i];
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      if (file) {
        files.push(file);
      }
    }
  }

  if (files.length === 0) {
    throw new Error('剪贴板中没有图片');
  }

  return uploadMultipleImages(files, category);
}

/**
 * 压缩图片
 */
export function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 计算新尺寸
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // 设置canvas尺寸
      canvas.width = width;
      canvas.height = height;

      // 绘制压缩后的图片
      ctx?.drawImage(img, 0, 0, width, height);

      // 转换为Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('图片压缩失败'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 验证图片文件
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '不支持的图片格式，请使用 JPEG、PNG、GIF 或 WebP 格式',
    };
  }

  // 检查文件大小
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '图片文件大小不能超过5MB',
    };
  }

  // 检查文件名
  if (!file.name || file.name.length > 255) {
    return {
      valid: false,
      error: '文件名无效或过长',
    };
  }

  return { valid: true };
}

/**
 * 获取图片信息
 */
export function getImageInfo(file: File): Promise<{
  width: number;
  height: number;
  size: number;
  type: string;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        type: file.type,
      });
    };

    img.onerror = () => reject(new Error('无法读取图片信息'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 生成图片预览URL
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * 清理预览URL
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}
