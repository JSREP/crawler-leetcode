/**
 * 通用文件上传 API
 * 使用 Vercel Blob Store 存储文件
 */

import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

// 支持的文件类型
const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  document: ['application/pdf', 'text/plain', 'application/json'],
  archive: ['application/zip', 'application/x-tar'],
} as const;

// 文件大小限制 (4.5MB for server uploads)
const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB

/**
 * 验证文件类型
 */
function validateFileType(contentType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(contentType);
}

/**
 * 生成文件路径
 */
function generateFilePath(filename: string, category: string = 'general'): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = filename.split('.').pop();
  return `${category}/${timestamp}-${randomId}.${extension}`;
}

/**
 * POST - 上传文件
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 检查环境变量
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'Blob storage not configured' },
        { status: 500 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const category = searchParams.get('category') || 'general';
    const fileType = searchParams.get('type') || 'image';

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // 获取文件内容
    const body = await request.blob();
    
    // 检查文件大小
    if (body.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // 验证文件类型
    const contentType = body.type;
    const allowedTypes = ALLOWED_FILE_TYPES[fileType as keyof typeof ALLOWED_FILE_TYPES] || ALLOWED_FILE_TYPES.image;
    
    if (!validateFileType(contentType, allowedTypes)) {
      return NextResponse.json(
        { error: `File type ${contentType} not allowed for category ${fileType}` },
        { status: 400 }
      );
    }

    // 生成存储路径
    const storagePath = generateFilePath(filename, category);

    // 上传到 Vercel Blob Store
    const blob = await put(storagePath, body, {
      access: 'public',
      contentType: contentType,
    });

    // 返回上传结果
    return NextResponse.json({
      success: true,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      size: body.size,
      contentType: contentType,
      filename: filename,
      category: category,
      uploadedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('File upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET - 获取上传配置信息
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    maxFileSize: MAX_FILE_SIZE,
    allowedTypes: ALLOWED_FILE_TYPES,
    categories: ['general', 'avatars', 'challenges', 'documents'],
    configured: !!process.env.BLOB_READ_WRITE_TOKEN,
  });
}
