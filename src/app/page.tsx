'use client';

import { useState } from 'react';
import { Plus, Search, Trash2, RefreshCw, Settings, Database } from 'lucide-react';
import { useConfigs } from '@/hooks/useConfigs';
import ConfigForm from '@/components/ConfigForm';
import ConfigList from '@/components/ConfigList';
import { ConfigItem } from '@/types/config';

export default function Home() {
  const {
    configs,
    loading,
    error,
    refreshConfigs,
    searchConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    batchDeleteConfigs,
  } = useConfigs();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ConfigItem | null>(null);
  const [selectedConfigs, setSelectedConfigs] = useState<string[]>([]);

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    searchConfigs(keyword);
  };

  const handleSelectConfig = (key: string) => {
    setSelectedConfigs(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    if (selectedConfigs.length === configs.length) {
      setSelectedConfigs([]);
    } else {
      setSelectedConfigs(configs.map(config => config.key));
    }
  };

  const handleEditConfig = (config: ConfigItem) => {
    setEditingConfig(config);
    setShowEditForm(true);
  };

  const handleDeleteConfig = async (key: string) => {
    if (window.confirm(`确定要删除配置 "${key}" 吗？`)) {
      await deleteConfig(key);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedConfigs.length === 0) return;
    
    if (window.confirm(`确定要删除选中的 ${selectedConfigs.length} 个配置吗？`)) {
      const success = await batchDeleteConfigs(selectedConfigs);
      if (success) {
        setSelectedConfigs([]);
      }
    }
  };

  const handleCreateSubmit = async (data: any) => {
    const success = await createConfig(data);
    if (success) {
      setShowCreateForm(false);
    }
    return success;
  };

  const handleEditSubmit = async (data: any) => {
    if (!editingConfig) return false;
    const success = await updateConfig(editingConfig.key, data);
    if (success) {
      setShowEditForm(false);
      setEditingConfig(null);
    }
    return success;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Database className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">动态配置中心</h1>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <Settings size={16} />
                <span>配置管理系统</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                共 {configs.length} 个配置
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 工具栏 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              新建配置
            </button>
            
            {selectedConfigs.length > 0 && (
              <button
                onClick={handleBatchDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                删除选中 ({selectedConfigs.length})
              </button>
            )}

            <button
              onClick={() => {
                setSearchKeyword('');
                refreshConfigs();
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              刷新
            </button>
          </div>

          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full sm:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="搜索配置键、值、描述或标签..."
            />
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 配置列表 */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading && configs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mr-3" />
              <span className="text-gray-500">加载中...</span>
            </div>
          ) : (
            <ConfigList
              configs={configs}
              selectedConfigs={selectedConfigs}
              onSelectConfig={handleSelectConfig}
              onSelectAll={handleSelectAll}
              onEditConfig={handleEditConfig}
              onDeleteConfig={handleDeleteConfig}
            />
          )}
        </div>
      </main>

      {/* 创建配置表单 */}
      <ConfigForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateSubmit}
        title="新建配置"
      />

      {/* 编辑配置表单 */}
      <ConfigForm
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setEditingConfig(null);
        }}
        onSubmit={handleEditSubmit}
        editingConfig={editingConfig}
        title="编辑配置"
      />
    </div>
  );
}
