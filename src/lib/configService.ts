import redis from "./redis";
import {
  ConfigItem,
  CreateConfigRequest,
  UpdateConfigRequest,
  ConfigItemResponse,
} from "@/types/config";
import { parseConfigValue } from "@/utils/convert";

const CONFIG_KEY_PREFIX = "config:";
const CONFIG_LIST_KEY = "config:list";

export class ConfigService {
  // 将 ConfigItem 转换为 ConfigItemResponse
  private static transformConfigItem(config: ConfigItem): ConfigItemResponse {
    return {
      ...config,
      value: parseConfigValue(config.value, config.type),
    };
  }

  // 获取所有配置列表
  static async getAllConfigs(): Promise<ConfigItemResponse[]> {
    try {
      const keys = await redis.smembers(CONFIG_LIST_KEY);
      if (keys.length === 0) return [];

      const configKeys = keys.map((key) => `${CONFIG_KEY_PREFIX}${key}`);
      const configs = await redis.mget(configKeys);

      return configs
        .filter((config) => config !== null)
        .map((config) => JSON.parse(config as string) as ConfigItem)
        .map((config) => this.transformConfigItem(config))
        .sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error("获取配置列表失败:", error);
      throw new Error("获取配置列表失败");
    }
  }

  // 根据key获取单个配置
  static async getConfig(key: string): Promise<ConfigItemResponse | null> {
    try {
      const config = await redis.get(`${CONFIG_KEY_PREFIX}${key}`);
      if (!config) return null;

      const parsedConfig = JSON.parse(config) as ConfigItem;
      return this.transformConfigItem(parsedConfig);
    } catch (error) {
      console.error("获取配置失败:", error);
      throw new Error("获取配置失败");
    }
  }

  // 创建新配置
  static async createConfig(
    data: CreateConfigRequest
  ): Promise<ConfigItemResponse> {
    try {
      // 检查key是否已存在
      const exists = await redis.exists(`${CONFIG_KEY_PREFIX}${data.key}`);
      if (exists) {
        throw new Error("配置键已存在");
      }

      const now = Date.now();
      const config: ConfigItem = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      // 保存配置数据
      await redis.set(
        `${CONFIG_KEY_PREFIX}${data.key}`,
        JSON.stringify(config)
      );
      // 添加到配置列表
      await redis.sadd(CONFIG_LIST_KEY, data.key);

      return this.transformConfigItem(config);
    } catch (error) {
      console.error("创建配置失败:", error);
      throw error;
    }
  }

  // 更新配置
  static async updateConfig(
    key: string,
    data: UpdateConfigRequest
  ): Promise<ConfigItemResponse> {
    try {
      const existingConfigData = await redis.get(`${CONFIG_KEY_PREFIX}${key}`);
      if (!existingConfigData) {
        throw new Error("配置不存在");
      }

      const existingConfig = JSON.parse(existingConfigData) as ConfigItem;
      const updatedConfig: ConfigItem = {
        ...existingConfig,
        ...data,
        updatedAt: Date.now(),
      };

      await redis.set(
        `${CONFIG_KEY_PREFIX}${key}`,
        JSON.stringify(updatedConfig)
      );
      return this.transformConfigItem(updatedConfig);
    } catch (error) {
      console.error("更新配置失败:", error);
      throw error;
    }
  }

  // 删除配置
  static async deleteConfig(key: string): Promise<boolean> {
    try {
      const exists = await redis.exists(`${CONFIG_KEY_PREFIX}${key}`);
      if (!exists) {
        throw new Error("配置不存在");
      }

      await redis.del(`${CONFIG_KEY_PREFIX}${key}`);
      await redis.srem(CONFIG_LIST_KEY, key);
      return true;
    } catch (error) {
      console.error("删除配置失败:", error);
      throw error;
    }
  }

  // 搜索配置
  static async searchConfigs(keyword: string): Promise<ConfigItemResponse[]> {
    try {
      const allConfigs = await this.getAllConfigs();
      if (!keyword) return allConfigs;

      const lowerKeyword = keyword.toLowerCase();
      return allConfigs.filter((config) => {
        // 对于搜索，我们需要将 value 转换为字符串进行匹配
        const valueStr =
          typeof config.value === "string"
            ? config.value
            : JSON.stringify(config.value);

        return (
          config.key.toLowerCase().includes(lowerKeyword) ||
          valueStr.toLowerCase().includes(lowerKeyword) ||
          config.description?.toLowerCase().includes(lowerKeyword) ||
          config.tags?.some((tag) => tag.toLowerCase().includes(lowerKeyword))
        );
      });
    } catch (error) {
      console.error("搜索配置失败:", error);
      throw error;
    }
  }

  // 批量删除配置
  static async batchDeleteConfigs(keys: string[]): Promise<boolean> {
    try {
      if (keys.length === 0) return true;

      const configKeys = keys.map((key) => `${CONFIG_KEY_PREFIX}${key}`);
      await redis.del(...configKeys);
      await redis.srem(CONFIG_LIST_KEY, ...keys);
      return true;
    } catch (error) {
      console.error("批量删除配置失败:", error);
      throw error;
    }
  }
}
