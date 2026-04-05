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
import { FieldType } from '@r-paas/meta';

interface FieldRendererProps {
  field: FieldInfo;
  disabled?: boolean;
  value?: any;
  onChange?: (value: any) => void;
  placeholder?: string;
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
export const FieldRenderer: React.FC<FieldRendererProps> = ({ field, disabled, value, onChange, placeholder: placeholderProp }) => {
  const { fieldType, config } = field;
  const options = config?.options || getMockOptions();
  // 优先使用外部传入的 placeholder，其次用配置，最后用默认
  const placeholder = placeholderProp || config?.placeholder || `请输入${field.fieldName}`;

  switch (fieldType) {
    case FieldType.Text:
      return <Input value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled} />;

    case FieldType.Text_Number:
      return (
        <InputNumber
          style={{ width: '100%' }}
          value={value}
          onChange={onChange}
          precision={config?.precision}
          placeholder={placeholder}
          disabled={disabled}
        />
      );

    case FieldType.Textarea:
      return (
        <Input.TextArea
          rows={3}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      );

    case FieldType.Text_Rich:
      return (
        <Input.TextArea
          rows={5}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      );

    case FieldType.TimePicker:
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

    case FieldType.DatePicker:
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

    case FieldType.MonthPicker:
      return (
        <DatePicker.MonthPicker
          style={{ width: '100%' }}
          value={value}
          onChange={onChange}
          disabled={disabled}
          getPopupContainer={trigger => trigger.parentElement!}
        />
      );

    case FieldType.YearPicker:
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

    case FieldType.SingleRadio:
      return <Radio.Group value={value} onChange={e => onChange?.(e.target.value)} disabled={disabled} options={options} />;

    case FieldType.MultipleCheckbox:
      return <Checkbox.Group value={value} onChange={onChange} disabled={disabled} options={options} />;

    case FieldType.SingleSelect:
      return (
        <Select
          style={{ width: '100%' }}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          options={options}
          disabled={disabled}
        />
      );

    case FieldType.MultipleSelect:
      return (
        <Select
          style={{ width: '100%' }}
          mode="multiple"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          options={options}
          disabled={disabled}
        />
      );

    case FieldType.TreeSelect:
      return (
        <TreeSelect
          style={{ width: '100%' }}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          treeData={config?.treeData || []}
          disabled={disabled}
        />
      );

    case FieldType.Cascader:
      return (
        <Cascader
          style={{ width: '100%' }}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          options={options}
          disabled={disabled}
        />
      );

    case FieldType.ColorSelect:
      return <ColorPicker value={value} onChange={onChange} disabled={disabled} />;

    default:
      return <Input value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled} />;
  }
};

/** 链接字段渲染（由 Form.Item 注入 value） */
const LinkableFieldRenderer: React.FC<{
  value?: any;
  linkConfig: { openMode?: string; linkUrl?: string };
}> = ({ value, linkConfig }) => {
  const handleClick = () => {
    const url = linkConfig.linkUrl!;
    switch (linkConfig.openMode) {
      case 'newPage': window.open(url, '_blank'); break;
      case 'push': window.history.pushState(null, '', url); break;
      default: window.location.href = url;
    }
  };
  return <a onClick={handleClick} style={{ cursor: 'pointer' }}>{value ?? '—'}</a>;
};

interface FieldExtraConfig {
  linkable?: boolean;
  openMode?: 'overlay' | 'newPage' | 'push';
  linkUrl?: string;
}

/** 将字段包装成 Form.Item，支持 tooltip、placeholder、linkable */
export const FormFieldItem: React.FC<{
  field: FieldInfo & { label?: string; required?: boolean; isHidden?: boolean };
  disabled?: boolean;
  tooltip?: string;
  placeholder?: string;
  linkable?: boolean;
  linkConfig?: FieldExtraConfig;
}> = ({ field, disabled, tooltip, placeholder, linkable, linkConfig }) => {
  if (field.isHidden) return null;

  // view 模式下 linkable：字段值渲染为可点击链接（用 LinkableField 组件读取 Form 值）
  if (linkable && linkConfig?.linkUrl) {
    return (
      <Form.Item
        name={field.fieldCode}
        label={field.label || field.fieldName}
        tooltip={tooltip}
      >
        <LinkableFieldRenderer linkConfig={linkConfig} />
      </Form.Item>
    );
  }

  return (
    <Form.Item
      name={field.fieldCode}
      label={field.label || field.fieldName}
      tooltip={tooltip}
      rules={field.required ? [{ required: true, message: `${field.fieldName}不能为空` }] : []}
    >
      <FieldRenderer field={field} disabled={disabled} placeholder={placeholder} />
    </Form.Item>
  );
};
