import React from 'react';
import { Card, Form, Input, Select, Switch, Button, message, Spin, Typography, Space, Tag } from 'antd';
import { SaveOutlined, RobotOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { aiApi } from '@/api/ai';
import type { AiConfigSaveParams } from '@/api/ai/interface';

const { Title, Text } = Typography;

const PROVIDERS = [
  { label: '智谱 AI (GLM)', value: 'zhipu' },
  { label: 'DeepSeek', value: 'deepseek' },
];

const MODEL_MAP: Record<string, string[]> = {
  zhipu: ['glm-4-flash', 'glm-4', 'glm-4-plus'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
};

const BASE_URL_MAP: Record<string, string> = {
  zhipu: 'https://open.bigmodel.cn/api/paas/v4',
  deepseek: 'https://api.deepseek.com',
};

const AiConfigPage: React.FC = () => {
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
          apiKey: '',  // API Key 不回显，需要重新输入
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
    setSaving(true);
    try {
      await aiApi.saveConfig(values);
      message.success('AI 配置保存成功');
    } catch (e: any) {
      message.error(e?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <Space align="center" style={{ marginBottom: 24 }}>
        <RobotOutlined style={{ fontSize: 24, color: '#1a1a1a' }} />
        <Title level={4} style={{ margin: 0 }}>AI 助手配置</Title>
        {config?.configured && <Tag color="success">已配置</Tag>}
      </Space>

      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        配置 AI 模型的 API Key 后，即可在系统中使用 AI 元数据助手。API Key 将加密存储在服务器端，不会暴露给前端。
      </Text>

      <Spin spinning={loading}>
        <Card>
          <Form
            form={form}
            layout="vertical"
            initialValues={{ provider: 'zhipu', baseUrl: BASE_URL_MAP.zhipu, defaultModel: 'glm-4-flash', enabled: true }}
          >
            <Form.Item label="模型提供商" name="provider" rules={[{ required: true }]}>
              <Select options={PROVIDERS} onChange={handleProviderChange} />
            </Form.Item>

            <Form.Item label="Base URL" name="baseUrl" rules={[{ required: true, message: '请输入 Base URL' }]}>
              <Input placeholder="如 https://open.bigmodel.cn/api/paas/v4" />
            </Form.Item>

            <Form.Item
              label="API Key"
              name="apiKey"
              rules={[{ required: !config?.configured, message: '请输入 API Key' }]}
              extra={config?.configured ? `当前已配置（${config.apiKey}），留空则保持不变` : ''}
            >
              <Input.Password placeholder={config?.configured ? '留空则保持当前 Key 不变' : '请输入 API Key'} />
            </Form.Item>

            <Form.Item label="默认模型" name="defaultModel" rules={[{ required: true }]}>
              <Select
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
        </Card>
      </Spin>
    </div>
  );
};

export default AiConfigPage;
