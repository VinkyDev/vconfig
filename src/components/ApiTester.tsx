"use client";

import { useState } from "react";
import {
  Drawer,
  Card,
  Button,
  Input,
  Space,
  Typography,
  message,
  Flex,
  Tag,
  Alert,
  Row,
  Col,
} from "antd";
import {
  ApiOutlined,
  SendOutlined,
  CopyOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import Editor from "@monaco-editor/react";

const { Text } = Typography;

interface ApiTesterProps {
  open: boolean;
  onClose: () => void;
}

interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  requestBody?: string;
}

const apiEndpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/configs",
    description: "获取所有配置列表",
    parameters: [
      {
        name: "search",
        type: "string",
        required: false,
        description: "搜索关键词",
      },
    ],
  },
  {
    method: "POST",
    path: "/api/configs",
    description: "创建新配置",
    requestBody: `{
  "key": "app.name",
  "value": "My App",
  "type": "string",
  "description": "应用名称",
  "tags": ["app", "basic"]
}`,
  },
  {
    method: "GET",
    path: "/api/configs/{key}",
    description: "获取单个配置",
  },
  {
    method: "PUT",
    path: "/api/configs/{key}",
    description: "更新配置",
    requestBody: `{
  "value": "new value",
  "description": "updated description",
  "tags": ["updated", "config"]
}`,
  },
  {
    method: "DELETE",
    path: "/api/configs/{key}",
    description: "删除配置",
  },
  {
    method: "DELETE",
    path: "/api/configs/batch",
    description: "批量删除配置",
    requestBody: `{
  "keys": ["config1", "config2", "config3"]
}`,
  },
  {
    method: "GET",
    path: "/api/health",
    description: "系统健康检查",
  },
];

export default function ApiTester({ open, onClose }: ApiTesterProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(
    apiEndpoints[0]
  );
  const [requestUrl, setRequestUrl] = useState("");
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const handleEndpointChange = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestUrl(endpoint.path);
    setRequestBody(endpoint.requestBody || "");
    setResponse("");
  };

  const sendRequest = async () => {
    setLoading(true);
    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (selectedEndpoint.method !== "GET" && requestBody) {
        options.body = requestBody;
      }

      let url = requestUrl;
      if (selectedEndpoint.method === "GET" && requestBody) {
        const params = new URLSearchParams();
        try {
          const bodyObj = JSON.parse(requestBody);
          Object.entries(bodyObj).forEach(([key, value]) => {
            params.append(key, String(value));
          });
          url += `?${params.toString()}`;
        } catch (e) {
          // 忽略JSON解析错误
        }
      }

      const res = await fetch(url, options);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems((prev) => new Set(prev).add(key));
      message.success("复制成功");
      setTimeout(() => {
        setCopiedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      message.error("复制失败");
    }
  };

  const getMethodColor = (method: string) => {
    const colors = {
      GET: "blue",
      POST: "green",
      PUT: "orange",
      DELETE: "red",
    };
    return colors[method as keyof typeof colors] || "default";
  };

  return (
    <Drawer
      title={
        <Flex align="center" gap="small">
          <ApiOutlined style={{ color: "#1890ff" }} />
          <Text strong>API 测试器</Text>
        </Flex>
      }
      open={open}
      onClose={onClose}
      width={800}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ padding: "16px" }}>
        <Card title="选择 API 端点" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            {apiEndpoints.map((endpoint, index) => (
              <Col span={12} key={index}>
                <Card
                  size="small"
                  hoverable
                  onClick={() => handleEndpointChange(endpoint)}
                  style={{
                    border:
                      selectedEndpoint === endpoint
                        ? "2px solid #1890ff"
                        : "1px solid #d9d9d9",
                  }}
                >
                  <Flex justify="space-between" align="center">
                    <Space>
                      <Tag color={getMethodColor(endpoint.method)}>
                        {endpoint.method}
                      </Tag>
                      <Text code style={{ fontSize: 12 }}>
                        {endpoint.path}
                      </Text>
                    </Space>
                  </Flex>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {endpoint.description}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        <Card title="请求配置" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Flex gap="middle" align="center">
              <Tag color={getMethodColor(selectedEndpoint.method)}>
                {selectedEndpoint.method}
              </Tag>
              <Input
                value={requestUrl}
                onChange={(e) => setRequestUrl(e.target.value)}
                placeholder="请求URL"
                style={{ flex: 1 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={sendRequest}
                loading={loading}
              >
                发送请求
              </Button>
            </Flex>

            {selectedEndpoint.parameters && (
              <Alert
                message="请求参数"
                description={
                  <Space direction="vertical" size="small">
                    {selectedEndpoint.parameters.map((param) => (
                      <Text key={param.name} style={{ fontSize: 12 }}>
                        <Text code>{param.name}</Text> ({param.type})
                        {param.required && <Text type="danger"> *</Text>}
                        {" - "}
                        {param.description}
                      </Text>
                    ))}
                  </Space>
                }
                type="info"
                showIcon
              />
            )}

            {selectedEndpoint.method !== "GET" &&
              selectedEndpoint.requestBody && (
                <div>
                  <Flex
                    justify="space-between"
                    align="center"
                    style={{ marginBottom: 8 }}
                  >
                    <Text strong>请求体</Text>
                    <Button
                      size="small"
                      icon={
                        copiedItems.has("requestBody") ? (
                          <CheckOutlined />
                        ) : (
                          <CopyOutlined />
                        )
                      }
                      onClick={() =>
                        copyToClipboard(requestBody, "requestBody")
                      }
                    >
                      复制
                    </Button>
                  </Flex>
                  <div
                    style={{
                      border: "1px solid #d9d9d9",
                      borderRadius: 6,
                    }}
                  >
                    <Editor
                      height="200px"
                      defaultLanguage="json"
                      value={requestBody}
                      onChange={(value) => setRequestBody(value || "")}
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 12,
                      }}
                    />
                  </div>
                </div>
              )}
          </Space>
        </Card>

        <Card
          title={
            <Flex justify="space-between" align="center">
              <Text strong>响应结果</Text>
              {response && (
                <Button
                  size="small"
                  icon={
                    copiedItems.has("response") ? (
                      <CheckOutlined />
                    ) : (
                      <CopyOutlined />
                    )
                  }
                  onClick={() => copyToClipboard(response, "response")}
                >
                  复制响应
                </Button>
              )}
            </Flex>
          }
        >
          {response ? (
            <div style={{ border: "1px solid #d9d9d9", borderRadius: 6 }}>
              <Editor
                height="300px"
                defaultLanguage="json"
                value={response}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 12,
                }}
              />
            </div>
          ) : (
            <div
              style={{
                height: 200,
                border: "1px dashed #d9d9d9",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
              }}
            >
              发送请求后响应结果将显示在这里
            </div>
          )}
        </Card>
      </div>
    </Drawer>
  );
}
