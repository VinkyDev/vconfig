import { useState, useEffect, useCallback } from 'react';
import { ConfigItem, CreateConfigRequest, UpdateConfigRequest } from '@/types/config';

interface UseConfigsReturn {
  configs: ConfigItem[];
  loading: boolean;
  error: string | null;
  refreshConfigs: () => Promise<void>;
  searchConfigs: (keyword: string) => Promise<void>;
  createConfig: (data: CreateConfigRequest) => Promise<boolean>;
  updateConfig: (key: string, data: UpdateConfigRequest) => Promise<boolean>;
  deleteConfig: (key: string) => Promise<boolean>;
  batchDeleteConfigs: (keys: string[]) => Promise<boolean>;
}

export function useConfigs(): UseConfigsReturn {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/configs');
      const result = await response.json();
      
      if (result.success) {
        setConfigs(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('获取配置列表失败');
      console.error('获取配置列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchConfigs = useCallback(async (keyword: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = keyword ? `/api/configs?search=${encodeURIComponent(keyword)}` : '/api/configs';
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setConfigs(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('搜索配置失败');
      console.error('搜索配置失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createConfig = useCallback(async (data: CreateConfigRequest): Promise<boolean> => {
    try {
      const response = await fetch('/api/configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      
      if (result.success) {
        await refreshConfigs();
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError('创建配置失败');
      console.error('创建配置失败:', err);
      return false;
    }
  }, [refreshConfigs]);

  const updateConfig = useCallback(async (key: string, data: UpdateConfigRequest): Promise<boolean> => {
    try {
      const response = await fetch(`/api/configs/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      
      if (result.success) {
        await refreshConfigs();
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError('更新配置失败');
      console.error('更新配置失败:', err);
      return false;
    }
  }, [refreshConfigs]);

  const deleteConfig = useCallback(async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/configs/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        await refreshConfigs();
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError('删除配置失败');
      console.error('删除配置失败:', err);
      return false;
    }
  }, [refreshConfigs]);

  const batchDeleteConfigs = useCallback(async (keys: string[]): Promise<boolean> => {
    try {
      const response = await fetch('/api/configs/batch', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keys }),
      });
      const result = await response.json();
      
      if (result.success) {
        await refreshConfigs();
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError('批量删除配置失败');
      console.error('批量删除配置失败:', err);
      return false;
    }
  }, [refreshConfigs]);

  useEffect(() => {
    refreshConfigs();
  }, [refreshConfigs]);

  return {
    configs,
    loading,
    error,
    refreshConfigs,
    searchConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    batchDeleteConfigs,
  };
} 