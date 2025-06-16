// 基础配置项接口，value 始终为字符串（用于存储）
export interface ConfigItem {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

// API 响应的配置项接口，value 根据 type 返回对应类型
export interface ConfigItemResponse {
  key: string;
  value: string | number | boolean | object;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateConfigRequest {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  tags?: string[];
}

export interface UpdateConfigRequest {
  value: string;
  description?: string;
  tags?: string[];
}

export interface ConfigListResponse {
  configs: ConfigItemResponse[];
  total: number;
  page: number;
  pageSize: number;
} 