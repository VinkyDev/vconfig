import { NextRequest, NextResponse } from 'next/server';
import { ConfigService } from '@/lib/configService';

// DELETE /api/configs/batch - 批量删除配置
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { keys } = body;
    
    if (!Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({
        success: false,
        error: '请提供要删除的配置键列表',
      }, { status: 400 });
    }

    await ConfigService.batchDeleteConfigs(keys);
    
    return NextResponse.json({
      success: true,
      message: `成功删除 ${keys.length} 个配置`,
    });
  } catch (error) {
    console.error('批量删除配置失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '批量删除配置失败',
    }, { status: 500 });
  }
} 