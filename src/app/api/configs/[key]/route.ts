import { NextRequest, NextResponse } from "next/server";
import { ConfigService } from "@/lib/configService";
import { UpdateConfigRequest } from "@/types/config";

// GET /api/configs/[key] - 获取单个配置
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const config = await ConfigService.getConfig(key);

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: "配置不存在",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("获取配置失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "获取配置失败",
      },
      { status: 500 }
    );
  }
}

// PUT /api/configs/[key] - 更新配置
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const body: UpdateConfigRequest = await request.json();

    // 验证必需字段
    if (!body.value) {
      return NextResponse.json(
        {
          success: false,
          error: "缺少必需字段: value",
        },
        { status: 400 }
      );
    }

    const config = await ConfigService.updateConfig(key, body);

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("更新配置失败:", error);
    const status =
      error instanceof Error && error.message === "配置不存在" ? 404 : 500;
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "更新配置失败",
      },
      { status }
    );
  }
}

// DELETE /api/configs/[key] - 删除配置
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    await ConfigService.deleteConfig(key);

    return NextResponse.json({
      success: true,
      message: "配置删除成功",
    });
  } catch (error) {
    console.error("删除配置失败:", error);
    const status =
      error instanceof Error && error.message === "配置不存在" ? 404 : 500;
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "删除配置失败",
      },
      { status }
    );
  }
}
