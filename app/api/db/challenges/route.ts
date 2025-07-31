/**
 * 挑战列表 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { getChallengesPaginated, createChallenge, DatabaseError } from '@/lib/db/database';
import { DatabaseChallenge } from '@/types/challenge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 解析查询参数
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');
    const platform = searchParams.get('platform') || undefined;
    const difficulty = searchParams.get('difficulty') ? parseInt(searchParams.get('difficulty')!) : undefined;
    const tag = searchParams.get('tag') || undefined;
    const query = searchParams.get('query') || undefined;
    
    // 验证参数
    if (page < 1 || perPage < 1 || perPage > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    
    // 获取数据
    const result = await getChallengesPaginated(page, perPage, {
      platform,
      difficulty,
      tag,
      query
    });
    
    return NextResponse.json({
      challenges: result.challenges,
      total: result.total,
      pages: result.pages,
      current_page: page,
      per_page: perPage
    });
    
  } catch (error) {
    console.error('Get challenges error:', error);
    
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必需字段
    const requiredFields = ['id_alias', 'name', 'platform', 'difficulty_level', 'base64_url'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // 验证数据类型
    if (typeof body.difficulty_level !== 'number' || body.difficulty_level < 1 || body.difficulty_level > 5) {
      return NextResponse.json(
        { error: 'difficulty_level must be a number between 1 and 5' },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(body.tags)) {
      body.tags = [];
    }
    
    // 创建挑战数据对象
    const challengeData: Omit<DatabaseChallenge, 'id' | 'created_at' | 'updated_at'> = {
      id_alias: body.id_alias,
      name: body.name,
      name_en: body.name_en || null,
      platform: body.platform,
      difficulty_level: body.difficulty_level,
      description_markdown: body.description_markdown || null,
      description_markdown_en: body.description_markdown_en || null,
      base64_url: body.base64_url,
      is_expired: Boolean(body.is_expired),
      tags: body.tags
    };
    
    // 创建挑战
    const challengeId = await createChallenge(challengeData);
    
    return NextResponse.json(
      {
        id: challengeId,
        message: 'Challenge created successfully'
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Create challenge error:', error);
    
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    );
  }
}
