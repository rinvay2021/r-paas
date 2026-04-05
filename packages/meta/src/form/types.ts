import type { FieldInfo } from '../field/types';

export type ConditionOperator =
  | 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte'
  | 'contains' | 'empty' | 'notEmpty';

export interface LinkageCondition {
  field: string;
  operator: ConditionOperator | string;
  value: any;
}

export interface LinkageAction {
  show?: string[];
  hide?: string[];
  require?: string[];
  unrequire?: string[];
  readonly?: string[];
  editable?: string[];
  clear?: string[];
}

export interface LinkageSetting {
  id: string;
  condition: LinkageCondition;
  actions: LinkageAction;
}

export type LinkageSettings = LinkageSetting[];

/** 帮助设置 */
export interface FormHelpSettings {
  type?: 'info' | 'warning' | 'error' | 'success';
  tipType?: ('tooltip' | 'link')[];
  tooltip?: string;
  linkUrl?: string;
  linkText?: string;
}

/** 布局设置 */
export interface FormLayoutSettings {
  title?: string;
  labelAlign?: 'left' | 'right';
  layout?: 'horizontal' | 'vertical';
  size?: 'small' | 'middle' | 'large';
  variant?: 'outlined' | 'filled' | 'borderless';
  colon?: boolean;
  labelWrap?: boolean;
  columns?: number;
}

export interface FormConfig {
  helpSettings?: FormHelpSettings;
  layoutSettings?: FormLayoutSettings;
  linkageSettings?: LinkageSetting[];
}

/** 字段更多设置 */
export interface FieldExtraConfig {
  defaultScopes?: ('create' | 'edit' | 'view')[];
  linkable?: boolean;
  openMode?: 'overlay' | 'newPage' | 'push';
  linkUrl?: string;
}

export type ContainerMode = 'editable' | 'readonly' | 'hidden';

export interface ContainerField extends FieldInfo {
  label?: string;
  required?: boolean;
  displayModes?: string[];
  isHidden?: boolean;
  // 模式配置
  createMode?: ContainerMode;
  editMode?: ContainerMode;
  viewMode?: ContainerMode;
  // 字段配置
  placeholder?: string;
  tooltip?: string;
  extraConfig?: FieldExtraConfig;
}

export interface FormContainer {
  id: string;
  title?: string;
  columns?: number;
  createMode?: ContainerMode;
  editMode?: ContainerMode;
  viewMode?: ContainerMode;
  isHidden?: boolean;
  fields?: ContainerField[];
}

export interface FormData {
  _id?: string;
  formCode: string;
  formName: string;
  formDesc?: string;
  appCode: string;
  metaObjectCode: string;
  containers?: FormContainer[];
  formConfig?: FormConfig;
}
