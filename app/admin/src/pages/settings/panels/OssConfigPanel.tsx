import React from 'react';
import { Form, Input, Select, Button, message, Alert, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Text } = Typography;

const OSS_PROVIDERS = [
  { label: '阿里云 OSS', value: 'aliyun' },
  { label: '腾讯云 COS', value: 'tencent' },
  { label: '七牛云', value: 'qiniu' },
  { label: 'MinIO（私有部署）', value: 'minio' },
];

const OssConfigPanel: React.FC = () => {
  const [form] = Form.useForm();
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    setSaving(true);
    try {
      // TODO: 对接后端 OSS 配置接口
      await new Promise(r => setTimeout(r, 500));
      message.success('OSS 配置保存成功');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <Alert
        type="warning"
        showIcon
        message="OSS 配置功能即将上线，当前为预览界面"
        style={{ marginBottom: 24 }}
      />

      <Form form={form} layout="vertical">
        <Form.Item label="存储服务商" name="provider">
          <Select options={OSS_PROVIDERS} placeholder="选择 OSS 服务商" style={{ maxWidth: 300 }} />
        </Form.Item>

        <Form.Item label="Endpoint / 域名" name="endpoint">
          <Input placeholder="如 oss-cn-hangzhou.aliyuncs.com" />
        </Form.Item>

        <Form.Item label="Bucket 名称" name="bucket">
          <Input placeholder="存储桶名称" />
        </Form.Item>

        <Form.Item label="Access Key ID" name="accessKeyId">
          <Input placeholder="访问密钥 ID" />
        </Form.Item>

        <Form.Item label="Access Key Secret" name="accessKeySecret">
          <Input.Password placeholder="访问密钥 Secret" />
        </Form.Item>

        <Form.Item label="自定义域名（可选）" name="customDomain" extra="配置后上传的文件将使用此域名访问">
          <Input placeholder="如 https://cdn.example.com" />
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
    </div>
  );
};

export default OssConfigPanel;
