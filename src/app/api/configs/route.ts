import { NextRequest, NextResponse } from 'next/server';
import { ConfigService } from '@/lib/configService';
import { CreateConfigRequest } from '@/types/config';
import groupBy from 'lodash/groupBy';

// GET /api/configs - 获取配置列表或搜索配置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('search');
    const groupByKey = searchParams.get('groupByKey');
    const configs = keyword 
      ? await ConfigService.searchConfigs(keyword)
      : await ConfigService.getAllConfigs();

    if (groupByKey) {
      const groupConfig = groupBy(configs, 'key');
      return NextResponse.json({
        success: true,
        data: groupConfig,
      });
    }

    return NextResponse.json({
      success: true,
      data: configs,
      total: configs.length,
    });
  } catch (error) {
    console.error('获取配置列表失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取配置列表失败',
    }, { status: 500 });
  }
}

// POST /api/configs - 创建新配置
export async function POST(request: NextRequest) {
  try {
    const body: CreateConfigRequest = await request.json();
    
    // 验证必需字段
    if (!body.key || !body.value || !body.type) {
      return NextResponse.json({
        success: false,
        error: '缺少必需字段: key, value, type',
      }, { status: 400 });
    }

    // 验证配置键格式
    if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(body.key)) {
      return NextResponse.json({
        success: false,
        error: '配置键格式无效，应以字母开头，只能包含字母、数字、点、下划线和连字符',
      }, { status: 400 });
    }

    // 验证JSON格式
    if (body.type === 'json') {
      try {
        JSON.parse(body.value);
      } catch {
        return NextResponse.json({
          success: false,
          error: 'JSON格式无效',
        }, { status: 400 });
      }
    }

    const config = await ConfigService.createConfig(body);
    
    return NextResponse.json({
      success: true,
      data: config,
    }, { status: 201 });
  } catch (error) {
    console.error('创建配置失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '创建配置失败',
    }, { status: 500 });
  }
} 