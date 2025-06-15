'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { ConfigItem, CreateConfigRequest, UpdateConfigRequest } from '@/types/config';

interface ConfigFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateConfigRequest | UpdateConfigRequest) => Promise<boolean>;
  editingConfig?: ConfigItem | null;
  title: string;
}

export default function ConfigForm({ isOpen, onClose, onSubmit, editingConfig, title }: ConfigFormProps) {
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    type: 'string' as 'string' | 'number' | 'boolean' | 'json',
    description: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingConfig) {
      setFormData({
        key: editingConfig.key,
        value: editingConfig.value,
        type: editingConfig.type,
        description: editingConfig.description || '',
        tags: editingConfig.tags || [],
      });
    } else {
      setFormData({
        key: '',
        value: '',
        type: 'string',
        description: '',
        tags: [],
      });
    }
    setError('');
  }, [editingConfig, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 验证表单数据
      if (!formData.value) {
        setError('配置值不能为空');
        return;
      }

      if (!editingConfig && !formData.key) {
        setError('配置键不能为空');
        return;
      }

      // 验证JSON格式
      if (formData.type === 'json') {
        try {
          JSON.parse(formData.value);
        } catch {
          setError('JSON格式无效');
          return;
        }
      }

      const success = await onSubmit(formData);
      if (success) {
        onClose();
      }
    } catch (err) {
      setError('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === e.currentTarget) {
      e.preventDefault();
      addTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {!editingConfig && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                配置键 *
              </label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如: database.host"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              数据类型
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="string">字符串</option>
              <option value="number">数字</option>
              <option value="boolean">布尔值</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              配置值 *
            </label>
            {formData.type === 'json' ? (
              <textarea
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                rows={6}
                placeholder='{"key": "value"}'
                required
              />
            ) : (
              <input
                type={formData.type === 'number' ? 'number' : 'text'}
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  formData.type === 'boolean' ? 'true 或 false' : 
                  formData.type === 'number' ? '123' :
                  '配置值'
                }
                required
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="配置的描述信息..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入标签后按回车添加"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                添加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 