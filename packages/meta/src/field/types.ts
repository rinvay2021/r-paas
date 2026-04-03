/** 字段类型枚举 */
export enum FieldType {
  Text = 'Text',
  Text_Number = 'Text_Number',
  Textarea = 'Textarea',
  Text_Rich = 'Text_Rich',
  TimePicker = 'TimePicker',
  DatePicker = 'DatePicker',
  MonthPicker = 'MonthPicker',
  YearPicker = 'YearPicker',
  SingleRadio = 'SingleRadio',
  MultipleCheckbox = 'MultipleCheckbox',
  SingleSelect = 'SingleSelect',
  MultipleSelect = 'MultipleSelect',
  TreeSelect = 'TreeSelect',
  Cascader = 'Cascader',
  LocationSelect = 'LocationSelect',
  FileUpload = 'FileUpload',
  ImageUpload = 'ImageUpload',
  ColorSelect = 'ColorSelect',
}

/** 时间选择器子类型 */
export enum TimePickerTypeEnum {
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Quarter = 'quarter',
  Year = 'year',
}

/** 文本输入子类型 */
export enum TextInputTypeEnum {
  Text = 'Text',
  Password = 'Password',
  Tel = 'Tel',
  Email = 'Email',
  Url = 'Url',
}

/** 字段配置 */
export interface FieldConfig {
  inputType?: string;
  precision?: number;
  format?: string;
  showTime?: number;
  use12Hours?: number;
  timeType?: string;
  datasourceCode?: string;
  multiple?: number;
  options?: { label: string; value: string }[];
  treeData?: any[];
  [key: string]: any;
}

/** 字段基础信息 */
export interface FieldInfo {
  _id?: string;
  fieldCode: string;
  fieldName: string;
  fieldType: string;
  fieldDesc?: string;
  isEnabled?: number;
  config?: FieldConfig;
}
