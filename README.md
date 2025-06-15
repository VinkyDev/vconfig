# 动态配置中心

一个基于 Next.js + TypeScript + Redis 的动态配置管理系统，提供简洁的 Web GUI 用于管理应用配置。

## 功能特性

- 🚀 **现代化界面**: 基于 Next.js 15 + React 19 + TypeScript + Tailwind CSS
- 📊 **配置管理**: 支持字符串、数字、布尔值、JSON 等多种数据类型
- 🔍 **智能搜索**: 支持按配置键、值、描述、标签进行搜索
- 🏷️ **标签系统**: 支持为配置添加多个标签，便于分类管理
- 📝 **描述信息**: 为每个配置项添加详细描述
- ⚡ **实时操作**: 增删改查配置项，立即生效
- 🔐 **数据安全**: 配置值默认隐藏，点击查看
- 📋 **一键复制**: 支持复制配置键和配置值
- 🗑️ **批量操作**: 支持批量删除配置项
- 💾 **持久化存储**: 基于 Redis 存储，性能高效

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Redis
- **图标**: Lucide React
- **包管理**: pnpm

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```bash
# Redis 配置
REDIS_URL=redis://default:25l25w8c@dbconn.sealosgzg.site:35253

# 应用配置
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=动态配置中心
```

### 3. 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 访问应用。

### 4. 健康检查

访问 [http://localhost:3000/api/health](http://localhost:3000/api/health) 检查 Redis 连接状态。

## API 接口

### 配置管理

- `GET /api/configs` - 获取配置列表
- `GET /api/configs?search=keyword` - 搜索配置
- `POST /api/configs` - 创建新配置
- `GET /api/configs/[key]` - 获取单个配置
- `PUT /api/configs/[key]` - 更新配置
- `DELETE /api/configs/[key]` - 删除配置
- `DELETE /api/configs/batch` - 批量删除配置

### 健康检查

- `GET /api/health` - 系统健康状态

## 数据结构

### 配置项 (ConfigItem)

```typescript
interface ConfigItem {
  key: string;                    // 配置键
  value: string;                  // 配置值
  type: 'string' | 'number' | 'boolean' | 'json'; // 数据类型
  description?: string;           // 描述信息
  tags?: string[];               // 标签列表
  createdAt: number;             // 创建时间戳
  updatedAt: number;             // 更新时间戳
}
```

## 使用指南

### 创建配置

1. 点击"新建配置"按钮
2. 填写配置键（只能包含字母、数字、点、下划线、连字符）
3. 选择数据类型
4. 输入配置值
5. 可选：添加描述和标签
6. 点击"保存"

### 编辑配置

1. 点击配置项操作菜单
2. 选择"编辑"
3. 修改配置值、描述或标签
4. 点击"保存"

### 搜索配置

在搜索框中输入关键词，支持搜索：
- 配置键
- 配置值  
- 描述信息
- 标签

### 批量操作

1. 勾选要操作的配置项
2. 点击"删除选中"按钮
3. 确认删除

## 项目结构

```
src/
├── app/
│   ├── api/                    # API 路由
│   │   ├── configs/           # 配置管理 API
│   │   └── health/            # 健康检查 API
│   ├── globals.css            # 全局样式
│   ├── layout.tsx             # 布局组件
│   └── page.tsx               # 主页面
├── components/                # React 组件
│   ├── ConfigForm.tsx         # 配置表单
│   └── ConfigList.tsx         # 配置列表
├── hooks/                     # 自定义 Hooks
│   └── useConfigs.ts          # 配置管理 Hook
├── lib/                       # 工具库
│   ├── redis.ts               # Redis 连接
│   └── configService.ts       # 配置服务
└── types/                     # 类型定义
    └── config.ts              # 配置相关类型
```

## 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 添加环境变量 `REDIS_URL`
4. 部署

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 开发

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

### 提交规范

- feat: 新功能
- fix: 修复问题
- docs: 文档更新
- style: 代码格式化
- refactor: 代码重构
- test: 测试相关
- chore: 构建配置等

## 许可证

MIT License
