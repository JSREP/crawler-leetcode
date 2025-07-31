/**
 * 数据库连接测试 API
 */
import { NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/db/database';

export async function GET() {
  try {
    const isConnected = await testDatabaseConnection();
    
    if (isConnected) {
      return NextResponse.json({
        status: 'success',
        message: 'Database connection is working',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Database connection failed'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
