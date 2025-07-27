/**
 * 挑战统计信息 API
 */
import { NextResponse } from 'next/server';
import { getChallengeStats, DatabaseError } from '@/lib/database';

export async function GET() {
  try {
    const stats = await getChallengeStats();
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Get challenge stats error:', error);
    
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch challenge statistics' },
      { status: 500 }
    );
  }
}
