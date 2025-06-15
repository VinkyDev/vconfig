import redis from './redis';
import { ConfigItem, CreateConfigRequest, UpdateConfigRequest } from '@/types/config';

const CONFIG_KEY_PREFIX = 'config:';
const CONFIG_LIST_KEY = 'config:list';

export class ConfigService {
  // 获取所有配置列表
  static async getAllConfigs(): Promise<ConfigItem[]> {
    try {
      const keys = await redis.smembers(CONFIG_LIST_KEY);
      if (keys.length === 0) return [];

      const configKeys = keys.map(key => `${CONFIG_KEY_PREFIX}${key}`);
      const configs = await redis.mget(configKeys);
      
      return configs
        .filter(config => config !== null)
        .map(config => JSON.parse(config as string))
        .sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error('获取配置列表失败:', error);
      throw new Error('获取配置列表失败');
    }
  }

  // 根据key获取单个配置
  static async getConfig(key: string): Promise<ConfigItem | null> {
    try {
      const config = await redis.get(`${CONFIG_KEY_PREFIX}${key}`);
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.error('获取配置失败:', error);
      throw new Error('获取配置失败');
    }
  }

  // 创建新配置
  static async createConfig(data: CreateConfigRequest): Promise<ConfigItem> {
    try {
      // 检查key是否已存在
      const exists = await redis.exists(`${CONFIG_KEY_PREFIX}${data.key}`);
      if (exists) {
        throw new Error('配置键已存在');
      }

      const now = Date.now();
      const config: ConfigItem = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      // 保存配置数据
      await redis.set(`${CONFIG_KEY_PREFIX}${data.key}`, JSON.stringify(config));
      // 添加到配置列表
      await redis.sadd(CONFIG_LIST_KEY, data.key);

      return config;
    } catch (error) {
      console.error('创建配置失败:', error);
      throw error;
    }
  }

  // 更新配置
  static async updateConfig(key: string, data: UpdateConfigRequest): Promise<ConfigItem> {
    try {
      const existingConfig = await this.getConfig(key);
      if (!existingConfig) {
        throw new Error('配置不存在');
      }

      const updatedConfig: ConfigItem = {
        ...existingConfig,
        ...data,
        updatedAt: Date.now(),
      };

      await redis.set(`${CONFIG_KEY_PREFIX}${key}`, JSON.stringify(updatedConfig));
      return updatedConfig;
    } catch (error) {
      console.error('更新配置失败:', error);
      throw error;
    }
  }

  // 删除配置
  static async deleteConfig(key: string): Promise<boolean> {
    try {
      const exists = await redis.exists(`${CONFIG_KEY_PREFIX}${key}`);
      if (!exists) {
        throw new Error('配置不存在');
      }

      await redis.del(`${CONFIG_KEY_PREFIX}${key}`);
      await redis.srem(CONFIG_LIST_KEY, key);
      return true;
    } catch (error) {
      console.error('删除配置失败:', error);
      throw error;
    }
  }

  // 搜索配置
  static async searchConfigs(keyword: string): Promise<ConfigItem[]> {
    try {
      const allConfigs = await this.getAllConfigs();
      if (!keyword) return allConfigs;

      const lowerKeyword = keyword.toLowerCase();
      return allConfigs.filter(config =>
        config.key.toLowerCase().includes(lowerKeyword) ||
        config.value.toLowerCase().includes(lowerKeyword) ||
        config.description?.toLowerCase().includes(lowerKeyword) ||
        config.tags?.some(tag => tag.toLowerCase().includes(lowerKeyword))
      );
    } catch (error) {
      console.error('搜索配置失败:', error);
      throw error;
    }
  }

  // 批量删除配置
  static async batchDeleteConfigs(keys: string[]): Promise<boolean> {
    try {
      if (keys.length === 0) return true;

      const configKeys = keys.map(key => `${CONFIG_KEY_PREFIX}${key}`);
      await redis.del(...configKeys);
      await redis.srem(CONFIG_LIST_KEY, ...keys);
      return true;
    } catch (error) {
      console.error('批量删除配置失败:', error);
      throw error;
    }
  }
} 