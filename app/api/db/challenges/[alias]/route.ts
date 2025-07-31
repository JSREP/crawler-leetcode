/**
 * 单个挑战详情 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { getChallengeByAlias, updateChallenge, DatabaseError } from '@/lib/db/database';

interface RouteParams {
  params: {
    alias: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { alias } = params;
    
    if (!alias) {
      return NextResponse.json(
        { error: 'Challenge alias is required' },
        { status: 400 }
      );
    }
    
    const challenge = await getChallengeByAlias(alias);
    
    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(challenge);
    
  } catch (error) {
    console.error('Get challenge by alias error:', error);
    
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch challenge' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { alias } = params;
    const body = await request.json();
    
    if (!alias) {
      return NextResponse.json(
        { error: 'Challenge alias is required' },
        { status: 400 }
      );
    }
    
    // 先获取现有挑战以获取ID
    const existingChallenge = await getChallengeByAlias(alias);
    if (!existingChallenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }
    
    // 验证数据类型
    if (body.difficulty_level && (typeof body.difficulty_level !== 'number' || body.difficulty_level < 1 || body.difficulty_level > 5)) {
      return NextResponse.json(
        { error: 'difficulty_level must be a number between 1 and 5' },
        { status: 400 }
      );
    }
    
    // 更新挑战
    const success = await updateChallenge(existingChallenge.id, body);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update challenge' },
        { status: 500 }
      );
    }
    
    // 返回更新后的挑战
    const updatedChallenge = await getChallengeByAlias(alias);
    
    return NextResponse.json({
      message: 'Challenge updated successfully',
      challenge: updatedChallenge
    });
    
  } catch (error) {
    console.error('Update challenge error:', error);
    
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update challenge' },
      { status: 500 }
    );
  }
}
