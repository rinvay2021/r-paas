import type { FieldInfo } from '../field';

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

export interface LinkageCondition {
  field: string;
  operator: string;
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

export interface FormConfig {
  helpSettings?: Record<string, string>;
  layoutSettings?: Record<string, any>;
  linkageSettings?: LinkageSetting[];
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
