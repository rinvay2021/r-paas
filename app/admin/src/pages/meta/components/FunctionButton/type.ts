import { Rule } from 'antd/es/form';
import { DefaultOptionType } from 'antd/es/select';

// 帮助类型枚举
export enum HelpType {
  TOOLTIP = 'tooltip',
  LINK = 'link',
}

// 按钮级别枚举
export enum ButtonLevel {
  View = 'View',
  List = 'List',
  ListRow = 'ListRow',
}

// 事件类型枚举
export enum ButtonEventType {
  System = 'System',
  Custom = 'Custom',
}

// 列表行事件枚举
export enum ListRowButtonEvent {
  Update = 'Update',
  Delete = 'Delete',
}

// 列表事件枚举
export enum ListButtonEvent {
  Create = 'Create',
}

// 视图事件枚举
export enum ViewButtonEvent {
  Create = 'Create',
  Export = 'Export',
  Import = 'Import',
  BatchDelete = 'BatchDelete',
  BatchUpdate = 'BatchUpdate',
}

// 布尔值枚举
export enum BooleanEnum {
  NO = 0,
  YES = 1,
}

export interface ButtonConfigItem {
  type:
    | 'ProFormText'
    | 'ProFormDigit'
    | 'ProFormSelect'
    | 'ProFormRadio.Group'
    | 'ProFormTextArea'
    | 'ProFormSwitch';
  label: string;
  name: string;
  tooltip?: string;
  'x-component-props'?: {
    required?: boolean;
    placeholder?: string;
    rules?: Rule[];
    options?: DefaultOptionType[];
    [key: string]: any;
  };
}

// 功能按钮基础字段
export interface FunctionButtonBase {
  buttonName: string; // 按钮名称
  buttonCode: string; // 按钮编码
  buttonDesc?: string; // 按钮描述
  buttonOrder?: number; // 排序
  buttonHelpType?: HelpType; // 帮助类型
  buttonHelpTip?: string; // 帮助提示
  buttonHelpLink?: string; // 帮助链接
  buttonLevel: ButtonLevel; // 按钮级别
  buttonEventType: ButtonEventType; // 事件类型
  buttonEvent: string; // 事件
  buttonConfig?: Record<string, any>; // 扩展配置
}

// 系统字段
export interface SystemFieldProps {
  _id?: string; // 唯一标识
  createdAt?: string; // 创建时间
  updatedAt?: string; // 更新时间
  creator?: string; // 创建人
  updater?: string; // 更新人
}

// 组合成最终的列表项类型
export type FunctionButtonListItem = FunctionButtonBase & SystemFieldProps;

// 列操作函数
export type ColumnsOperators = {
  handleEdit?: (record: FunctionButtonListItem) => void;
  handleDelete?: (record: FunctionButtonListItem) => void;
  handleEnable?: (record: FunctionButtonListItem) => void;
};

// 按钮弹窗Props
export interface ButtonModalProps {
  id?: string;
  appCode: string;
  metaObjectCode: string;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  onFinish?: (values: FunctionButtonListItem) => void;
}
