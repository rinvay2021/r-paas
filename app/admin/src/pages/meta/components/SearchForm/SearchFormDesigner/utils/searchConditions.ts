import { FieldTypeEnum } from '@/pages/meta/components/BaseField/type';

/**
 * SQL 查询条件操作符
 */
export enum SqlConditionOperator {
  /** 等于 */
  EQUAL = '=',
  /** 不等于 */
  NOT_EQUAL = '!=',
  /** 包含（模糊查询） */
  LIKE = 'like',
  /** 大于 */
  GREATER_THAN = '>',
  /** 大于等于 */
  GREATER_THAN_OR_EQUAL = '>=',
  /** 小于 */
  LESS_THAN = '<',
  /** 小于等于 */
  LESS_THAN_OR_EQUAL = '<=',
  /** 范围 */
  BETWEEN = 'between',
  /** 在列表中 */
  IN = 'in',
  /** 不在列表中 */
  NOT_IN = 'not_in',
  /** 为空 */
  IS_NULL = 'is_null',
  /** 不为空 */
  IS_NOT_NULL = 'is_not_null',
}

/**
 * 查询条件选项
 */
export interface SqlConditionOption {
  label: string;
  value: SqlConditionOperator;
}

/**
 * 不支持搜索的字段类型
 */
export const UNSEARCHABLE_FIELD_TYPES = [
  FieldTypeEnum.FileUpload,
  FieldTypeEnum.ImageUpload,
  FieldTypeEnum.Text_Rich,
];

/**
 * 判断字段类型是否可搜索
 */
export function isFieldSearchable(fieldType: FieldTypeEnum): boolean {
  return !UNSEARCHABLE_FIELD_TYPES.includes(fieldType);
}

/**
 * 根据字段类型获取可用的 SQL 查询条件
 */
export function getSqlConditionsByFieldType(fieldType: FieldTypeEnum): SqlConditionOption[] {
  // 文本类型字段
  if (fieldType === FieldTypeEnum.Text || fieldType === FieldTypeEnum.Textarea) {
    return [
      { label: '等于', value: SqlConditionOperator.EQUAL },
      { label: '包含', value: SqlConditionOperator.LIKE },
    ];
  }

  // 数字类型字段
  if (fieldType === FieldTypeEnum.Text_Number) {
    return [
      { label: '等于', value: SqlConditionOperator.EQUAL },
      { label: '范围', value: SqlConditionOperator.BETWEEN },
    ];
  }

  // 日期时间类型字段
  if (
    fieldType === FieldTypeEnum.DatePicker ||
    fieldType === FieldTypeEnum.MonthPicker ||
    fieldType === FieldTypeEnum.YearPicker ||
    fieldType === FieldTypeEnum.TimePicker
  ) {
    return [
      { label: '等于', value: SqlConditionOperator.EQUAL },
      { label: '范围', value: SqlConditionOperator.BETWEEN },
    ];
  }

  // 单选类型字段
  if (
    fieldType === FieldTypeEnum.SingleSelect ||
    fieldType === FieldTypeEnum.SingleRadio
  ) {
    return [
      { label: '等于', value: SqlConditionOperator.EQUAL },
    ];
  }

  // 多选类型字段
  if (
    fieldType === FieldTypeEnum.MultipleSelect ||
    fieldType === FieldTypeEnum.MultipleCheckbox
  ) {
    return [
      { label: '等于', value: SqlConditionOperator.EQUAL },
    ];
  }

  // 树形选择、级联选择、地区选择
  if (
    fieldType === FieldTypeEnum.TreeSelect ||
    fieldType === FieldTypeEnum.Cascader ||
    fieldType === FieldTypeEnum.LocationSelect
  ) {
    return [
      { label: '等于', value: SqlConditionOperator.EQUAL },
    ];
  }

  // 颜色选择器
  if (fieldType === FieldTypeEnum.ColorSelect) {
    return [
      { label: '等于', value: SqlConditionOperator.EQUAL },
    ];
  }

  // 默认返回基础条件
  return [
    { label: '等于', value: SqlConditionOperator.EQUAL },
  ];
}

/**
 * 判断查询条件是否需要范围输入（两个值）
 */
export function isRangeCondition(condition: SqlConditionOperator): boolean {
  return condition === SqlConditionOperator.BETWEEN;
}

/**
 * 判断查询条件是否需要多选输入
 */
export function isMultipleCondition(condition: SqlConditionOperator): boolean {
  return [SqlConditionOperator.IN, SqlConditionOperator.NOT_IN].includes(condition);
}
