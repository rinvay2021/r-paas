import React from 'react';
import {
  Input,
  InputNumber,
  Select,
  DatePicker,
  TimePicker,
  Radio,
  Checkbox,
  Upload,
  ColorPicker,
  TreeSelect,
  Cascader,
  Form,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { FieldInfo } from '@/api/renderer/interface';

interface FieldRendererProps {
  field: FieldInfo;
  disabled?: boolean;
  value?: any;
  onChange?: (value: any) => void;
}

/** 根据字段类型生成 mock 选项 */
function getMockOptions() {
  return [
    { label: '选项一', value: 'opt1' },
    { label: '选项二', value: 'opt2' },
    { label: '选项三', value: 'opt3' },
  ];
}

/** 根据字段类型渲染对应的 antd 控件 */
export const FieldRenderer: React.FC<FieldRendererProps> = ({ field, disabled, value, onChange }) => {
  const { fieldType, config } = field;
  const options = config?.options || getMockOptions();

  switch (fieldType) {
    case 'Text':
      return <Input value={value} onChange={e => onChange?.(e.target.value)} placeholder={`请输入${field.fieldName}`} disabled={disabled} />;

    case 'Text_Number':
      return (
        <InputNumber
          style={{ width: '100%' }}
          value={value}
          onChange={onChange}
          precision={config?.precision}
          placeholder={`请输入${field.fieldName}`}
          disabled={disabled}
        />
      );

    case 'Textarea':
      return (
        <Input.TextArea
          rows={3}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={`请输入${field.fieldName}`}
          disabled={disabled}
        />
      );

    case 'Text_Rich':
      return (
        <Input.TextArea
          rows={5}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={`请输入${field.fieldName}（富文本）`}
          disabled={disabled}
        />
      );

    case 'TimePicker':
      return (
        <TimePicker
          style={{ width: '100%' }}
          value={value}
          onChange={onChange}
          format={config?.format || 'HH:mm:ss'}
          disabled={disabled}
          getPopupContainer={trigger => trigger.parentElement!}
        />
      );

    case 'DatePicker':
      return (
        <DatePicker
          style={{ width: '100%' }}
          value={value}
          onChange={onChange}
          showTime={!!config?.showTime}
          format={config?.format}
          disabled={disabled}
          getPopupContainer={trigger => trigger.parentElement!}
        />
      );

    case 'MonthPicker':
      return (
        <DatePicker.MonthPicker
          style={{ width: '100%' }}
          value={value}
          onChange={onChange}
          disabled={disabled}
          getPopupContainer={trigger => trigger.parentElement!}
        />
      );

    case 'YearPicker':
      return (
        <DatePicker
          style={{ width: '100%' }}
          value={value}
          onChange={onChange}
          picker="year"
          disabled={disabled}
          getPopupContainer={trigger => trigger.parentElement!}
        />
      );

    case 'SingleRadio':
      return <Radio.Group value={value} onChange={e => onChange?.(e.target.value)} disabled={disabled} options={options} />;

    case 'MultipleCheckbox':
      return <Checkbox.Group value={value} onChange={onChange} disabled={disabled} options={options} />;

    case 'SingleSelect':
      return (
        <Select
          style={{ width: '100%' }}
          value={value}
          onChange={onChange}
          placeholder={`请选择${field.fieldName}`}
          options={options}
          disabled={disabled}
        />
      );

    case 'MultipleSelect':
      return (
        <Select
          style={{ width: '100%' }}
          mode="multiple"
          value={value}
          onChange={onChange}
          placeholder={`请选择${field.fieldName}`}
          options={options}
          disabled={disabled}
        />
      );

    case 'TreeSelect':
      return (
        <TreeSelect
          style={{ width: '100%' }}
          value={value}
          onChange={onChange}
          placeholder={`请选择${field.fieldName}`}
          treeData={config?.treeData || []}
          disabled={disabled}
        />
      );

    case 'Cascader':
      return (
        <Cascader
          style={{ width: '100%' }}
          value={value}
          onChange={onChange}
          placeholder={`请选择${field.fieldName}`}
          options={options}
          disabled={disabled}
        />
      );

    case 'ColorSelect':
      return <ColorPicker value={value} onChange={onChange} disabled={disabled} />;

    default:
      return <Input value={value} onChange={e => onChange?.(e.target.value)} placeholder={`请输入${field.fieldName}`} disabled={disabled} />;
  }
};

/** 将字段包装成 Form.Item */
export const FormFieldItem: React.FC<{
  field: FieldInfo & { label?: string; required?: boolean; isHidden?: boolean };
  disabled?: boolean;
}> = ({ field, disabled }) => {
  if (field.isHidden) return null;

  return (
    <Form.Item
      name={field.fieldCode}
      label={field.label || field.fieldName}
      rules={field.required ? [{ required: true, message: `${field.fieldName}不能为空` }] : []}
    >
      <FieldRenderer field={field} disabled={disabled} />
    </Form.Item>
  );
};
