export interface ConfigItem {
  key: string;
  value: string;
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
  configs: ConfigItem[];
  total: number;
  page: number;
  pageSize: number;
} 