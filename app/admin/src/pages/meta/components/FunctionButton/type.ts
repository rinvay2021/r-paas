import { Rule } from 'antd/es/form';
import { DefaultOptionType } from 'antd/es/select';

// 从 @r-paas/meta re-export，保持现有引用路径不变
import { ButtonLevel, ButtonEventType, ButtonEvent, HelpType, BooleanEnum } from '@r-paas/meta';
export type { ActionButton } from '@r-paas/meta';

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

// 功能按钮基础字段（admin 私有）
export interface FunctionButtonBase {
  buttonName: string;
  buttonCode: string;
  buttonDesc?: string;
  buttonOrder?: number;
  buttonHelpType?: HelpType;
  buttonHelpTip?: string;
  buttonHelpLink?: string;
  buttonLevel: ButtonLevel;
  buttonEventType: ButtonEventType;
  buttonEvent: string;
  buttonConfig?: Record<string, any>;
}

export interface SystemFieldProps {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  creator?: string;
  updater?: string;
}

export type FunctionButtonListItem = FunctionButtonBase & SystemFieldProps;

export type ColumnsOperators = {
  handleEdit?: (record: FunctionButtonListItem) => void;
  handleDelete?: (record: FunctionButtonListItem) => void;
  handleEnable?: (record: FunctionButtonListItem) => void;
};

export interface ButtonModalProps {
  id?: string;
  appCode: string;
  metaObjectCode: string;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  onFinish?: (values: FunctionButtonListItem) => void;
}
