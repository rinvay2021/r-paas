import { FieldType } from './types';

/** 不支持搜索的字段类型 */
export const UNSEARCHABLE_FIELD_TYPES: FieldType[] = [
  FieldType.FileUpload,
  FieldType.ImageUpload,
  FieldType.Text_Rich,
];

/** 字段类型分组选项 */
export const FIELD_TYPE_GROUPS = [
  { label: '文本', value: FieldType.Text },
  { label: '数字', value: FieldType.Text_Number },
  { label: '多行文本', value: FieldType.Textarea },
  { label: '富文本', value: FieldType.Text_Rich },
  { label: '时间', value: FieldType.TimePicker },
  { label: '日期', value: FieldType.DatePicker },
  { label: '月份', value: FieldType.MonthPicker },
  { label: '年份', value: FieldType.YearPicker },
  { label: '单选按钮', value: FieldType.SingleRadio },
  { label: '复选框', value: FieldType.MultipleCheckbox },
  { label: '下拉单选', value: FieldType.SingleSelect },
  { label: '下拉多选', value: FieldType.MultipleSelect },
  { label: '树状选择', value: FieldType.TreeSelect },
  { label: '级联选择', value: FieldType.Cascader },
  { label: '地区选择', value: FieldType.LocationSelect },
  { label: '文件上传', value: FieldType.FileUpload },
  { label: '图片上传', value: FieldType.ImageUpload },
  { label: '颜色选择', value: FieldType.ColorSelect },
];
