import React from 'react';
import { Form, Input, Select, Switch, Button, message, Spin, Typography, Space, Tag, Alert } from 'antd';
import { SaveOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { aiApi } from '@/api/ai';
import type { AiConfigSaveParams } from '@/api/ai/interface';

const { Text } = Typography;

const PROVIDERS = [
  { label: '智谱 AI (GLM)', value: 'zhipu' },
  { label: 'DeepSeek', value: 'deepseek' },
];

const MODEL_MAP: Record<string, string[]> = {
  zhipu: ['glm-4.7-flash', 'glm-4.5-air'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
};

const BASE_URL_MAP: Record<string, string> = {
  zhipu: 'https://open.bigmodel.cn/api/paas/v4',
  deepseek: 'https://api.deepseek.com',
};

const AiConfigPanel: React.FC = () => {
  const [form] = Form.useForm();
  const [provider, setProvider] = React.useState<string>('zhipu');
  const [saving, setSaving] = React.useState(false);

  const { data, loading } = useRequest(() => aiApi.getConfig(), {
    onSuccess: (res) => {
      const config = (res as any)?.data;
      if (config?.configured) {
        form.setFieldsValue({
          provider: config.provider,
          baseUrl: config.baseUrl,
          defaultModel: config.defaultModel,
          enabled: config.enabled,
          apiKey: '',
        });
        setProvider(config.provider || 'zhipu');
      }
    },
  });

  const config = (data as any)?.data;

  const handleProviderChange = (val: string) => {
    setProvider(val);
    form.setFieldsValue({
      baseUrl: BASE_URL_MAP[val] || '',
      defaultModel: MODEL_MAP[val]?.[0] || '',
    });
  };

  const handleSave = async () => {
    let values: AiConfigSaveParams;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    // 留空 apiKey 时不传，保持原有 Key
    if (!values.apiKey) {
      delete (values as any).apiKey;
    }
    setSaving(true);
    try {
      await aiApi.saveConfig(values);
      message.success('AI 配置保存成功');
    } catch {
      // 拦截器统一处理
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <Alert
        type="info"
        showIcon
        message="API Key 将使用 AES-256 加密后存储在服务器，不会暴露给前端"
        style={{ marginBottom: 24 }}
      />

      {config?.configured && (
        <Space style={{ marginBottom: 20 }}>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <Text type="success">AI 助手已配置并启用</Text>
          <Tag color="blue">{config.provider}</Tag>
          <Tag>{config.defaultModel}</Tag>
        </Space>
      )}

      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ provider: 'zhipu', baseUrl: BASE_URL_MAP.zhipu, defaultModel: 'glm-4.7-flash', enabled: true }}
        >
          <Form.Item label="模型提供商" name="provider" rules={[{ required: true }]}>
            <Select options={PROVIDERS} onChange={handleProviderChange} style={{ maxWidth: 300 }} />
          </Form.Item>

          <Form.Item label="Base URL" name="baseUrl" rules={[{ required: true, message: '请输入 Base URL' }]}>
            <Input placeholder="如 https://open.bigmodel.cn/api/paas/v4" />
          </Form.Item>

          <Form.Item
            label="API Key"
            name="apiKey"
            rules={[{ required: !config?.configured, message: '请输入 API Key' }]}
            extra={config?.configured ? `已配置（${config.apiKey}），留空则保持不变` : undefined}
          >
            <Input.Password
              placeholder={config?.configured ? '留空则保持当前 Key 不变' : '请输入 API Key'}
            />
          </Form.Item>

          <Form.Item label="默认模型" name="defaultModel" rules={[{ required: true }]}>
            <Select
              style={{ maxWidth: 300 }}
              options={(MODEL_MAP[provider] || []).map(m => ({ label: m, value: m }))}
              placeholder="选择默认模型"
            />
          </Form.Item>

          <Form.Item label="启用 AI 助手" name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSave}
              style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
            >
              保存配置
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

export default AiConfigPanel;
