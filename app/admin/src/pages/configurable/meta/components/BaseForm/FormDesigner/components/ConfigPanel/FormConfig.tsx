import React from 'react';
import { Form, Input, Radio } from 'antd';
import type { FormConfig } from '../../types';

interface FormConfigProps {
  config: FormConfig;
  onChange: (values: Partial<FormConfig>) => void;
}

export const FormConfigPanel: React.FC<FormConfigProps> = ({ config, onChange }) => {
  return (
    <Form layout="vertical">
      <Form.Item label="表单名称">
        <Input
          value={config.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="请输入表单名称"
        />
      </Form.Item>
      <Form.Item label="表单名称">
        <Input
          value={config.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="请输入表单名称"
        />
      </Form.Item>
      <Form.Item label="表单名称">
        <Input
          value={config.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="请输入表单名称"
        />
      </Form.Item>

      <Form.Item label="表单名称">
        <Input
          value={config.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="请输入表单名称"
        />
      </Form.Item>
      <Form.Item label="表单名称">
        <Input
          value={config.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="请输入表单名称"
        />
      </Form.Item>
      <Form.Item label="表单名称">
        <Input
          value={config.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="请输入表单名称"
        />
      </Form.Item>
      <Form.Item label="默认列数">
        <Radio.Group value={config.columns} onChange={e => onChange({ columns: e.target.value })}>
          <Radio.Button value={1}>1列</Radio.Button>
          <Radio.Button value={2}>2列</Radio.Button>
          <Radio.Button value={3}>3列</Radio.Button>
        </Radio.Group>
      </Form.Item>
    </Form>
  );
};
