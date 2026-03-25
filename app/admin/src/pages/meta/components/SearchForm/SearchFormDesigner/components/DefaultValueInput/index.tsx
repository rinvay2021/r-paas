import React from 'react';
import {
  Input,
  InputNumber,
  Select,
  DatePicker,
  TimePicker,
  Space,
} from 'antd';
import { FieldTypeEnum } from '@/pages/meta/components/BaseField/type';
import { SqlConditionOperator, isRangeCondition, isMultipleCondition } from '../../utils/searchConditions';

const { RangePicker } = DatePicker;

interface DefaultValueInputProps {
  fieldType: FieldTypeEnum;
  condition: SqlConditionOperator;
  value?: any;
  onChange?: (value: any) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * 默认值输入组件
 * 根据字段类型和查询条件动态渲染不同的输入组件
 */
const DefaultValueInput: React.FC<DefaultValueInputProps> = ({
  fieldType,
  condition,
  value,
  onChange,
  disabled = false,
  placeholder = '请输入默认值',
}) => {
  // 文本类型
  if (fieldType === FieldTypeEnum.Text || fieldType === FieldTypeEnum.Textarea) {
    return (
      <Input
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
      />
    );
  }

  // 数字类型
  if (fieldType === FieldTypeEnum.Text_Number) {
    // 范围查询
    if (isRangeCondition(condition)) {
      const [min, max] = Array.isArray(value) ? value : [undefined, undefined];
      return (
        <Space.Compact style={{ width: '100%' }}>
          <InputNumber
            style={{ width: '50%' }}
            value={min}
            onChange={val => onChange?.([val, max])}
            disabled={disabled}
            placeholder="最小值"
          />
          <InputNumber
            style={{ width: '50%' }}
            value={max}
            onChange={val => onChange?.([min, val])}
            disabled={disabled}
            placeholder="最大值"
          />
        </Space.Compact>
      );
    }
    // 普通数字输入
    return (
      <InputNumber
        style={{ width: '100%' }}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
      />
    );
  }

  // 日期选择器
  if (fieldType === FieldTypeEnum.DatePicker) {
    // 范围查询
    if (isRangeCondition(condition)) {
      return (
        <RangePicker
          style={{ width: '100%' }}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={['开始日期', '结束日期']}
        />
      );
    }
    // 单个日期
    return (
      <DatePicker
        style={{ width: '100%' }}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
      />
    );
  }

  // 月份选择器
  if (fieldType === FieldTypeEnum.MonthPicker) {
    // 范围查询
    if (isRangeCondition(condition)) {
      return (
        <RangePicker
          style={{ width: '100%' }}
          picker="month"
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={['开始月份', '结束月份']}
        />
      );
    }
    // 单个月份
    return (
      <DatePicker
        style={{ width: '100%' }}
        picker="month"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
      />
    );
  }

  // 年份选择器
  if (fieldType === FieldTypeEnum.YearPicker) {
    // 范围查询
    if (isRangeCondition(condition)) {
      return (
        <RangePicker
          style={{ width: '100%' }}
          picker="year"
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={['开始年份', '结束年份']}
        />
      );
    }
    // 单个年份
    return (
      <DatePicker
        style={{ width: '100%' }}
        picker="year"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
      />
    );
  }

  // 时间选择器
  if (fieldType === FieldTypeEnum.TimePicker) {
    // 范围查询
    if (isRangeCondition(condition)) {
      return (
        <TimePicker.RangePicker
          style={{ width: '100%' }}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={['开始时间', '结束时间']}
        />
      );
    }
    // 单个时间
    return (
      <TimePicker
        style={{ width: '100%' }}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
      />
    );
  }

  // 下拉单选/多选
  if (
    fieldType === FieldTypeEnum.SingleSelect ||
    fieldType === FieldTypeEnum.MultipleSelect
  ) {
    // 多选条件（in, not_in）或本身就是多选字段
    const isMultiple = isMultipleCondition(condition) || fieldType === FieldTypeEnum.MultipleSelect;

    return (
      <Select
        mode={isMultiple ? 'multiple' : undefined}
        style={{ width: '100%' }}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        options={[]}
        // TODO: 从字段配置中获取选项
      />
    );
  }

  // 单选按钮/复选框
  if (
    fieldType === FieldTypeEnum.SingleRadio ||
    fieldType === FieldTypeEnum.MultipleCheckbox
  ) {
    const isMultiple = isMultipleCondition(condition) || fieldType === FieldTypeEnum.MultipleCheckbox;

    return (
      <Select
        mode={isMultiple ? 'multiple' : undefined}
        style={{ width: '100%' }}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        options={[]}
        // TODO: 从字段配置中获取选项
      />
    );
  }

  // 树形选择/级联选择/地区选择
  if (
    fieldType === FieldTypeEnum.TreeSelect ||
    fieldType === FieldTypeEnum.Cascader ||
    fieldType === FieldTypeEnum.LocationSelect
  ) {
    return (
      <Select
        style={{ width: '100%' }}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        options={[]}
        // TODO: 从字段配置中获取数据
      />
    );
  }

  // 颜色选择器
  if (fieldType === FieldTypeEnum.ColorSelect) {
    return (
      <Input
        type="color"
        style={{ width: '100%' }}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
      />
    );
  }

  // 默认返回普通输入框
  return (
    <Input
      value={value}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
};

export default DefaultValueInput;
