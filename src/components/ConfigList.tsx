'use client';

import { useState } from 'react';
import { Edit3, Trash2, Copy, Eye, EyeOff, MoreVertical } from 'lucide-react';
import { ConfigItem } from '@/types/config';

interface ConfigListProps {
  configs: ConfigItem[];
  selectedConfigs: string[];
  onSelectConfig: (key: string) => void;
  onSelectAll: () => void;
  onEditConfig: (config: ConfigItem) => void;
  onDeleteConfig: (key: string) => void;
}

export default function ConfigList({
  configs,
  selectedConfigs,
  onSelectConfig,
  onSelectAll,
  onEditConfig,
  onDeleteConfig,
}: ConfigListProps) {
  const [visibleValues, setVisibleValues] = useState<Set<string>>(new Set());
  const [copiedKeys, setCopiedKeys] = useState<Set<string>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const toggleValueVisibility = (key: string) => {
    setVisibleValues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKeys(prev => new Set(prev).add(key));
      setTimeout(() => {
        setCopiedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const formatValue = (value: string, type: string) => {
    if (type === 'json') {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
    }
    return value;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'string':
        return 'bg-green-100 text-green-800';
      case 'number':
        return 'bg-blue-100 text-blue-800';
      case 'boolean':
        return 'bg-purple-100 text-purple-800';
      case 'json':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  if (configs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">暂无配置项</div>
        <div className="text-gray-400 text-sm mt-2">点击上方"新建配置"按钮添加第一个配置</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={configs.length > 0 && selectedConfigs.length === configs.length}
                  onChange={onSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                配置键
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                类型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                配置值
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                描述
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                标签
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                更新时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {configs.map((config) => (
              <tr key={config.key} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedConfigs.includes(config.key)}
                    onChange={() => onSelectConfig(config.key)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 font-mono">
                      {config.key}
                    </span>
                    <button
                      onClick={() => copyToClipboard(config.key, `key-${config.key}`)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="复制配置键"
                    >
                      <Copy size={14} />
                    </button>
                    {copiedKeys.has(`key-${config.key}`) && (
                      <span className="text-xs text-green-600">已复制</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(config.type)}`}>
                    {config.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      {visibleValues.has(config.key) ? (
                        <pre className="text-sm text-gray-900 font-mono whitespace-pre-wrap break-all max-w-xs overflow-hidden">
                          {formatValue(config.value, config.type)}
                        </pre>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {'*'.repeat(Math.min(config.value.length, 20))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleValueVisibility(config.key)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title={visibleValues.has(config.key) ? '隐藏值' : '显示值'}
                      >
                        {visibleValues.has(config.key) ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(config.value, `value-${config.key}`)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="复制配置值"
                      >
                        <Copy size={14} />
                      </button>
                      {copiedKeys.has(`value-${config.key}`) && (
                        <span className="text-xs text-green-600">已复制</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate" title={config.description}>
                    {config.description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {config.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-md"
                      >
                        {tag}
                      </span>
                    )) || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(config.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === config.key ? null : config.key)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {dropdownOpen === config.key && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onEditConfig(config);
                              setDropdownOpen(null);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <Edit3 size={14} />
                            编辑
                          </button>
                          <button
                            onClick={() => {
                              onDeleteConfig(config.key);
                              setDropdownOpen(null);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                          >
                            <Trash2 size={14} />
                            删除
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}