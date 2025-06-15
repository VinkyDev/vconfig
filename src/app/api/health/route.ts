import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    // 测试 Redis 连接
    const startTime = Date.now();
    await redis.ping();
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // 获取 Redis 信息
    const info = await redis.info('server');
    const redisVersion = info.match(/redis_version:([^\r\n]+)/)?.[1] || 'unknown';

    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      redis: {
        connected: true,
        version: redisVersion,
        responseTime: `${responseTime}ms`,
      },
    });
  } catch (error) {
    console.error('Redis连接检查失败:', error);
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      redis: {
        connected: false,
        error: error instanceof Error ? error.message : '连接失败',
      },
    }, { status: 500 });
  }
} 