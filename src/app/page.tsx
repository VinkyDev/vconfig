"use client";

import { useState } from "react";
import {
  Layout,
  Typography,
  Button,
  Input,
  Space,
  Alert,
  Spin,
  Card,
  Flex,
  theme,
  ConfigProvider,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DatabaseOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import { useConfigs } from "@/hooks/useConfigs";
import ConfigForm from "@/components/ConfigForm";
import ConfigList from "@/components/ConfigList";
import ApiTester from "@/components/ApiTester";
import {
  ConfigItem,
  CreateConfigRequest,
  UpdateConfigRequest,
} from "@/types/config";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

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

  const [searchKeyword, setSearchKeyword] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showApiTester, setShowApiTester] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ConfigItem | null>(null);
  const [selectedConfigs, setSelectedConfigs] = useState<string[]>([]);

  const { token } = theme.useToken();

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    searchConfigs(keyword);
  };

  const handleSelectConfig = (key: string) => {
    setSelectedConfigs((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    if (selectedConfigs.length === configs.length) {
      setSelectedConfigs([]);
    } else {
      setSelectedConfigs(configs.map((config) => config.key));
    }
  };

  const handleEditConfig = (config: ConfigItem) => {
    setEditingConfig(config);
    setShowEditForm(true);
  };

  const handleDeleteConfig = async (key: string) => {
    await deleteConfig(key);
  };

  const handleBatchDelete = async () => {
    if (selectedConfigs.length === 0) return;

    const success = await batchDeleteConfigs(selectedConfigs);
    if (success) {
      setSelectedConfigs([]);
    }
  };

  const handleCreateSubmit = async (data: CreateConfigRequest) => {
    const success = await createConfig(data);
    if (success) {
      setShowCreateForm(false);
    }
    return success;
  };

  const handleEditSubmit = async (data: UpdateConfigRequest) => {
    if (!editingConfig) return false;
    const success = await updateConfig(editingConfig.key, data);
    if (success) {
      setShowEditForm(false);
      setEditingConfig(null);
    }
    return success;
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
        },
      }}
    >
      <Layout
        style={{ minHeight: "100vh", backgroundColor: token.colorBgLayout }}
      >
        <Header
          style={{
            backgroundColor: "#fff",
            borderBottom: `1px solid ${token.colorBorder}`,
            position: "sticky",
            top: 0,
            zIndex: 1000,
            padding: "0 24px",
          }}
        >
          <Flex
            justify="space-between"
            align="center"
            style={{ height: "100%" }}
          >
            <Flex align="center" gap="middle">
              <Flex align="center" gap="small">
                <DatabaseOutlined
                  style={{ fontSize: 26, color: token.colorPrimary }}
                />
                <Title level={4} style={{ margin: 0, color: token.colorText }}>
                  VConfig - 动态配置中心
                </Title>
              </Flex>
            </Flex>
            <Text type="secondary">共 {configs.length} 个配置</Text>
          </Flex>
        </Header>

        <Content style={{ padding: "24px" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            <Card style={{ marginBottom: 24 }}>
              <Flex
                justify="space-between"
                align="center"
                wrap="wrap"
                gap="middle"
              >
                <Space wrap>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setShowCreateForm(true)}
                  >
                    新建配置
                  </Button>

                  <Button
                    icon={<ApiOutlined />}
                    onClick={() => setShowApiTester(true)}
                  >
                    API 测试
                  </Button>

                  {selectedConfigs.length > 0 && (
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleBatchDelete}
                    >
                      删除选中 ({selectedConfigs.length})
                    </Button>
                  )}

                  <Button
                    icon={<ReloadOutlined spin={loading} />}
                    onClick={() => {
                      setSearchKeyword("");
                      refreshConfigs();
                    }}
                    loading={loading}
                  >
                    刷新
                  </Button>
                </Space>

                <Search
                  placeholder="搜索配置键、值、描述或标签..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="middle"
                  style={{ width: 320 }}
                  value={searchKeyword}
                  onChange={(e) => handleSearch(e.target.value)}
                  onSearch={handleSearch}
                />
              </Flex>
            </Card>

            {error && (
              <Alert
                message="操作失败"
                description={error}
                type="error"
                showIcon
                closable
                style={{ marginBottom: 24 }}
              />
            )}

            <Card>
              {loading && configs.length === 0 ? (
                <Flex
                  justify="center"
                  align="center"
                  style={{ padding: "60px 0" }}
                >
                  <Space>
                    <Spin size="large" />
                    <Text type="secondary">加载中...</Text>
                  </Space>
                </Flex>
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
            </Card>
          </div>
        </Content>

        <ConfigForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateSubmit}
          title="新建配置"
        />

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

        <ApiTester
          open={showApiTester}
          onClose={() => setShowApiTester(false)}
        />
      </Layout>
    </ConfigProvider>
  );
}
