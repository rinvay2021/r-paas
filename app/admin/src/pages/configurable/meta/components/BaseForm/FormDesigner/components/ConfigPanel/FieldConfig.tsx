import React from 'react';
import { Form, Input, Select } from 'antd';
import type { Field } from '../../types';

interface FieldConfigProps {
  field: Field;
  onChange: (values: Partial<Field>) => void;
}

export const FieldConfigPanel: React.FC<FieldConfigProps> = ({ field, onChange }) => {
  return (
    <Form layout="vertical">
      <Form.Item label="字段名称">
        <Input
          value={field.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="请输入字段名称"
        />
      </Form.Item>
      <Form.Item label="字段类型">
        <Select
          value={field.type}
          onChange={value => onChange({ type: value })}
          options={[
            { label: '文本框', value: 'input' },
            { label: '数字框', value: 'number' },
            { label: '选择框', value: 'select' },
            { label: '日期选择', value: 'date' },
            { label: '文本域', value: 'textarea' },
            { label: '开关', value: 'switch' },
            { label: '单选框', value: 'radio' },
            { label: '多选框', value: 'checkbox' },
          ]}
        />
      </Form.Item>
      <Form.Item label="应用编码">
        <Input
          value={field.appCode}
          onChange={e => onChange({ appCode: e.target.value })}
          placeholder="请输入应用编码"
        />
      </Form.Item>
      <Form.Item label="元对象编码">
        <Input
          value={field.metaObjectCode}
          onChange={e => onChange({ metaObjectCode: e.target.value })}
          placeholder="请输入元对象编码"
        />
      </Form.Item>
      <Form.Item label="字段编码">
        <Input
          value={field.fieldCode}
          onChange={e => onChange({ fieldCode: e.target.value })}
          placeholder="请输入字段编码"
        />
      </Form.Item>
    </Form>
  );
};
