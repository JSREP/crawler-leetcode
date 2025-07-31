/**
 * 头像上传 API
 * 基于 Vercel 官方示例
 */

import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 检查环境变量
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'Blob storage not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // 验证文件类型（仅允许图片）
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const body = await request.blob();
    
    if (!allowedTypes.includes(body.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }

    // 检查文件大小 (最大 4.5MB)
    const maxSize = 4.5 * 1024 * 1024;
    if (body.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 4.5MB' },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const extension = filename.split('.').pop();
    const uniqueFilename = `avatars/${timestamp}-${filename}`;

    // 上传到 Vercel Blob Store
    const blob = await put(uniqueFilename, body, {
      access: 'public',
    });

    return NextResponse.json(blob);

  } catch (error) {
    console.error('Avatar upload error:', error);
    
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}
