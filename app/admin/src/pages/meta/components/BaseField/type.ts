import { Rule } from 'antd/es/form';
import { DefaultOptionType } from 'antd/es/select';

// 时间选择器类型枚举
export enum TimePickerTypeEnum {
  Day = 'day', // 日期
  Week = 'week', // 日期时间
  Month = 'month', // 日期
  Quarter = 'quarter', // 月份
  Year = 'year', // 年份
}

// 文本输入类型枚举
export enum TextInputTypeEnum {
  Text = 'Text', // 普通文本
  Password = 'Password', // 密码
  Tel = 'Tel', // 电话
  Email = 'Email', // 邮箱
  Url = 'Url', // URL
}

// 布尔值枚举
export enum BooleanEnum {
  NO = 0,
  YES = 1,
}

// 字段类型枚举
export enum FieldTypeEnum {
  Text = 'Text', // 文本
  Text_Number = 'Text_Number', // 数字输入
  Textarea = 'Textarea', // 多行文本
  Text_Rich = 'Text_Rich', // 富文本
  TimePicker = 'TimePicker', // 时间选择器
  DatePicker = 'DatePicker', // 日期选择器
  MonthPicker = 'MonthPicker', // 月份选择器
  YearPicker = 'YearPicker', // 年份选择器
  SingleRadio = 'SingleRadio', // 单选按钮
  MultipleCheckbox = 'MultipleCheckbox', // 复选框
  SingleSelect = 'SingleSelect', // 下拉单选
  MultipleSelect = 'MultipleSelect', // 下拉多选
  TreeSelect = 'TreeSelect', // 树状选择
  Cascader = 'Cascader', // 级联选择
  LocationSelect = 'LocationSelect', // 地区选择
  FileUpload = 'FileUpload', // 单件上传
  ImageUpload = 'ImageUpload', // 单图片上传
  ColorSelect = 'ColorSelect', // 颜色选择器
}

export interface FieldConfigItem {
  type:
    | 'ProFormText'
    | 'ProFormDigit'
    | 'ProFormSelect'
    | 'ProFormRadio.Group'
    | 'ProFormTextArea'
    | 'ProFormSwitch';
  label: string;
  name: string[] | string;
  tooltip?: string;
  'x-component-props'?: {
    required?: boolean;
    placeholder?: string;
    rules?: Rule[];
    options?: DefaultOptionType[];
    [key: string]: any;
  };
}

// 基础字段接口
export interface BaseFieldBase {
  fieldName: string; // 字段名称
  fieldCode: string; // 字段编码
  fieldDesc?: string; // 字段描述
  fieldType: FieldTypeEnum; // 字段类型
  isEnabled?: BooleanEnum; // 是否启用
}

// 字段配置对象（所有字段类型特有的配置都存在这里）
export interface FieldConfig {
  // 文本类型配置
  inputType?: string; // 文本类型（Text/Password/Tel/Email/Url）

  // 数字类型配置
  precision?: number; // 数字精度

  // 时间类型配置
  use12Hours?: BooleanEnum; // 是否12小时制
  format?: string; // 时间格式
  showTime?: BooleanEnum; // 是否显示时间
  timeType?: string; // 时间选择类型

  // 选择类型配置
  datasourceCode?: string; // 数据源编码
  multiple?: BooleanEnum; // 是否多选

  // 其他扩展配置
  [key: string]: any;
}

// 系统字段
export interface SystemFieldProps {
  _id: string; // 唯一标识
  createdAt?: string; // 创建时间
  updatedAt?: string; // 更新时间
  creator?: string; // 创建人
  updater?: string; // 更新人
}

// 组合成最终的列表项类型
export interface BaseFieldListItem extends BaseFieldBase, SystemFieldProps {
  config?: FieldConfig; // 字段配置对象
  appCode?: string; // 所属应用
  metaObjectCode?: string; // 所属对象
}

// 列操作函数
export type ColumnsOprators = {
  handleEdit?: (record: BaseFieldListItem) => void;
  handleDelete?: (record: BaseFieldListItem) => void;
  handleEnable?: (record: BaseFieldListItem) => void;
};

//字段ModalProps
export interface FieldModalProps {
  id?: string;
  appCode: string;
  metaObjectCode: string;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  onFinish?: (values: BaseFieldListItem) => void;
}
