'use client';

import { useState } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Space, 
  Tooltip, 
  Typography, 
  Modal, 
  message,
  Flex,
  Empty,
  Dropdown
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  CopyOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined,
  MoreOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ConfigItem } from '@/types/config';

const { Text, Paragraph } = Typography;
const { confirm } = Modal;

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

  const copyToClipboard = async (text: string, type: 'key' | 'value') => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(`${type === 'key' ? '配置键' : '配置值'}复制成功`);
    } catch (err) {
      message.error('复制失败');
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
    const colorMap = {
      string: 'green',
      number: 'blue',
      boolean: 'purple',
      json: 'orange',
    };
    return colorMap[type as keyof typeof colorMap] || 'default';
  };

  const handleDelete = (key: string) => {
    confirm({
      title: '确认删除',
      content: `确定要删除配置 "${key}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => onDeleteConfig(key),
    });
  };

  const getDropdownItems = (config: ConfigItem) => [
    {
      key: 'edit',
      label: '编辑',
      icon: <EditOutlined />,
      onClick: () => onEditConfig(config),
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(config.key),
    },
  ];

  const columns: ColumnsType<ConfigItem> = [
    {
      title: '配置键',
      dataIndex: 'key',
      key: 'key',
      width: 200,
      fixed: 'left',
      render: (key: string) => (
        <Flex align="center" gap="small">
          <Text code style={{ fontSize: 12 }}>{key}</Text>
          <Tooltip title="复制配置键">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(key, 'key')}
            />
          </Tooltip>
        </Flex>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{type}</Tag>
      ),
    },
    {
      title: '配置值',
      dataIndex: 'value',
      key: 'value',
      width: 300,
      render: (value: string, record: ConfigItem) => {
        const isVisible = visibleValues.has(record.key);
        const displayValue = isVisible ? formatValue(value, record.type) : '*'.repeat(Math.min(value.length, 20));
        
        return (
          <Flex align="flex-start" gap="small">
            <div style={{ flex: 1, minWidth: 0 }}>
              {isVisible && record.type === 'json' ? (
                <Paragraph
                  code
                  style={{ 
                    margin: 0, 
                    fontSize: 12, 
                    maxHeight: 100, 
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {displayValue}
                </Paragraph>
              ) : (
                <Text 
                  style={{ 
                    fontSize: 12,
                    color: isVisible ? undefined : '#999'
                  }}
                >
                  {displayValue}
                </Text>
              )}
            </div>
            <Space size="small">
              <Tooltip title={isVisible ? '隐藏值' : '显示值'}>
                <Button
                  type="text"
                  size="small"
                  icon={isVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={() => toggleValueVisibility(record.key)}
                />
              </Tooltip>
              <Tooltip title="复制配置值">
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(value, 'value')}
                />
              </Tooltip>
            </Space>
          </Flex>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (description: string) => (
        <Tooltip placement="topLeft" title={description || '暂无描述'}>
          <Text type={description ? undefined : 'secondary'}>
            {description || '暂无描述'}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <Space size={4} wrap>
          {tags && tags.length > 0 ? (
            tags.map((tag) => (
              <Tag key={tag}>
                {tag}
              </Tag>
            ))
          ) : (
            <Text type="secondary">无标签</Text>
          )}
        </Space>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (timestamp: number) => (
        <Text style={{ fontSize: 12 }}>
          {new Date(timestamp).toLocaleString('zh-CN')}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown 
          menu={{ items: getDropdownItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedConfigs,
    onChange: (selectedRowKeys: React.Key[]) => {
      // 处理全选/取消全选
      if (selectedRowKeys.length === configs.length && selectedConfigs.length < configs.length) {
        onSelectAll();
      } else if (selectedRowKeys.length === 0 && selectedConfigs.length > 0) {
        onSelectAll();
      } else {
        // 处理单个选择
        const newKey = selectedRowKeys.find(key => !selectedConfigs.includes(key as string)) ||
                      selectedConfigs.find(key => !selectedRowKeys.includes(key));
        if (newKey) {
          onSelectConfig(newKey as string);
        }
      }
    },
    onSelectAll: () => {
      onSelectAll();
    },
  };

  if (configs.length === 0) {
    return (
      <Empty
        description="暂无配置项"
        style={{ padding: '60px 0' }}
      >
        <Text type="secondary">点击上方"新建配置"按钮添加第一个配置</Text>
      </Empty>
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={configs}
      rowSelection={rowSelection}
      rowKey="key"
      scroll={{ x: 1200 }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        pageSizeOptions: ['10', '20', '50', '100'],
        defaultPageSize: 20,
      }}
      size="small"
      bordered
    />
  );
}