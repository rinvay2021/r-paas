import { Rule } from 'antd/es/form';
import { DefaultOptionType } from 'antd/es/select';

// 从 @r-paas/meta re-export，保持现有引用路径不变
export { FieldType as FieldTypeEnum } from '@r-paas/meta';
export type { FieldConfig, FieldInfo } from '@r-paas/meta';

// 时间选择器类型枚举（admin 私有）
export enum TimePickerTypeEnum {
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Quarter = 'quarter',
  Year = 'year',
}

// 文本输入类型枚举（admin 私有）
export enum TextInputTypeEnum {
  Text = 'Text',
  Password = 'Password',
  Tel = 'Tel',
  Email = 'Email',
  Url = 'Url',
}

// 布尔值枚举（admin 私有）
export enum BooleanEnum {
  NO = 0,
  YES = 1,
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

export interface BaseFieldBase {
  fieldName: string;
  fieldCode: string;
  fieldDesc?: string;
  fieldType: import('@r-paas/meta').FieldType;
  isEnabled?: BooleanEnum;
}

export interface SystemFieldProps {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  creator?: string;
  updater?: string;
}

export interface BaseFieldListItem extends BaseFieldBase, SystemFieldProps {
  config?: import('@r-paas/meta').FieldConfig;
  appCode?: string;
  metaObjectCode?: string;
}

export type ColumnsOprators = {
  handleEdit?: (record: BaseFieldListItem) => void;
  handleDelete?: (record: BaseFieldListItem) => void;
  handleEnable?: (record: BaseFieldListItem) => void;
};

export interface FieldModalProps {
  id?: string;
  appCode: string;
  metaObjectCode: string;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  onFinish?: (values: BaseFieldListItem) => void;
}
