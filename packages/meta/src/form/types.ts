import type { FieldInfo } from '../field/types';

export type ConditionOperator =
  | '==' | '!=' | '>' | '<' | '>=' | '<='
  | 'contains' | 'isEmpty' | 'isNotEmpty';

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

export interface FormConfig {
  helpSettings?: Record<string, string>;
  layoutSettings?: Record<string, any>;
  linkageSettings?: LinkageSetting[];
}

export interface ContainerField extends FieldInfo {
  label?: string;
  required?: boolean;
  displayModes?: string[];
  isHidden?: boolean;
}

export interface FormContainer {
  id: string;
  title?: string;
  columns?: number;
  createMode?: string;
  editMode?: string;
  viewMode?: string;
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
