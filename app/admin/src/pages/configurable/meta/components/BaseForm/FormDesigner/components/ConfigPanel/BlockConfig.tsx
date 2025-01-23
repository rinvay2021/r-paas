import React from 'react';
import { Form, Input, Radio } from 'antd';
import type { Container } from '../../types';

interface BlockConfigProps {
  container: Container;
  onChange: (values: Partial<Container>) => void;
}

export const BlockConfigPanel: React.FC<BlockConfigProps> = ({ container, onChange }) => {
  return (
    <Form layout="vertical">
      <Form.Item label="区块名称">
        <Input
          value={container.title}
          onChange={e => onChange({ title: e.target.value })}
          placeholder="请输入区块名称"
        />
      </Form.Item>
      <Form.Item label="列数">
        <Radio.Group
          value={container.columns}
          onChange={e => onChange({ columns: e.target.value })}
        >
          <Radio.Button value={1}>1列</Radio.Button>
          <Radio.Button value={2}>2列</Radio.Button>
          <Radio.Button value={3}>3列</Radio.Button>
        </Radio.Group>
      </Form.Item>
    </Form>
  );
};
