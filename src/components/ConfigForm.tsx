"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Tag,
  message,
  Flex,
  Typography,
  Divider,
} from "antd";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import Editor from "@monaco-editor/react";
import {
  ConfigItem,
  CreateConfigRequest,
  UpdateConfigRequest,
} from "@/types/config";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface ConfigFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateConfigRequest & UpdateConfigRequest
  ) => Promise<boolean>;
  editingConfig?: ConfigItem | null;
  title: string;
}

export default function ConfigForm({
  isOpen,
  onClose,
  onSubmit,
  editingConfig,
  title,
}: ConfigFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataType, setDataType] = useState<
    "string" | "number" | "boolean" | "json"
  >("json");
  const [jsonValue, setJsonValue] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (editingConfig) {
      form.setFieldsValue({
        key: editingConfig.key,
        value: editingConfig.value,
        type: editingConfig.type,
        description: editingConfig.description || "",
      });
      setDataType(editingConfig.type);
      setTags(editingConfig.tags || []);
      if (editingConfig.type === "json") {
        setJsonValue(editingConfig.value);
      }
    } else {
      form.resetFields();
      setDataType("json");
      setTags([]);
      setJsonValue("");
    }
  }, [editingConfig, isOpen, form]);

  const handleSubmit = async (
    values: CreateConfigRequest & UpdateConfigRequest
  ) => {
    setLoading(true);
    try {
      // 验证JSON格式
      if (dataType === "json") {
        try {
          JSON.parse(jsonValue);
          values.value = jsonValue;
        } catch {
          message.error("JSON格式无效");
          setLoading(false);
          return;
        }
      }

      const submitData = {
        ...values,
        tags,
        type: dataType,
      };

      const success = await onSubmit(submitData);
      if (success) {
        message.success(editingConfig ? "配置更新成功" : "配置创建成功");
        handleClose();
      }
    } catch (error) {
      message.error(
        `操作失败，请重试: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setTags([]);
    setJsonValue("");
    setDataType("json");
    onClose();
  };

  const handleTagClose = (removedTag: string) => {
    setTags(tags.filter((tag) => tag !== removedTag));
  };

  const showTagInput = () => {
    setInputVisible(true);
  };

  const handleTagInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue("");
  };

  const renderValueInput = () => {
    switch (dataType) {
      case "json":
        return (
          <div>
            <Text
              type="secondary"
              style={{ marginBottom: 8, display: "block" }}
            >
              JSON 编辑器
            </Text>
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <Editor
                height="200px"
                defaultLanguage="json"
                value={jsonValue}
                onChange={(value) => setJsonValue(value || "")}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </div>
          </div>
        );
      case "boolean":
        return (
          <Select placeholder="选择布尔值">
            <Option value="true">true</Option>
            <Option value="false">false</Option>
          </Select>
        );
      case "number":
        return <Input type="number" placeholder="请输入数字" />;
      default:
        return <Input placeholder="请输入配置值" />;
    }
  };

  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={800}
      centered
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 16 }}
        initialValues={{
          type: "json",
          value: "{}",
        }}
      >
        {!editingConfig && (
          <Form.Item
            label="配置键"
            name="key"
            rules={[
              { required: true, message: "请输入配置键" },
              {
                pattern: /^[a-zA-Z][a-zA-Z0-9._-]*$/,
                message:
                  "配置键应以字母开头，只能包含字母、数字、点、下划线和连字符",
              },
            ]}
          >
            <Input placeholder="例如: database.host" />
          </Form.Item>
        )}

        <Form.Item label="数据类型" name="type">
          <Select value={dataType} onChange={setDataType}>
            <Option value="string">字符串</Option>
            <Option value="number">数字</Option>
            <Option value="boolean">布尔值</Option>
            <Option value="json">JSON</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="配置值"
          name="value"
          rules={
            dataType !== "json"
              ? [{ required: true, message: "请输入配置值" }]
              : []
          }
        >
          {renderValueInput()}
        </Form.Item>

        <Form.Item label="描述" name="description">
          <TextArea
            rows={3}
            placeholder="配置的描述信息..."
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item label="标签">
          <Flex gap="4px 0" wrap>
            {tags.map((tag) => (
              <Tag
                key={tag}
                closable
                onClose={() => handleTagClose(tag)}
                closeIcon={<CloseOutlined />}
              >
                {tag}
              </Tag>
            ))}
            {inputVisible ? (
              <Input
                type="text"
                size="small"
                style={{ width: 120 }}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleTagInputConfirm}
                onPressEnter={handleTagInputConfirm}
                autoFocus
              />
            ) : (
              <Tag
                onClick={showTagInput}
                style={{ borderStyle: "dashed", cursor: "pointer" }}
              >
                <PlusOutlined /> 添加标签
              </Tag>
            )}
          </Flex>
        </Form.Item>

        <Divider />

        <Flex justify="end" gap="middle">
          <Button onClick={handleClose}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
        </Flex>
      </Form>
    </Modal>
  );
}
