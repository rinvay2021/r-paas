import type { FieldInfo } from '../field/types';

export interface SearchFormField {
  fieldName: string;
  displayName?: string;
  condition: string;
  defaultValueType?: 'custom' | 'system';
  defaultValue?: string;
  placeholder?: string;
  isVisible?: boolean;
  fieldInfo?: FieldInfo;
}

export interface SearchFormConfig {
  isCollapsible?: boolean;
  collapseRows?: number;
  cols?: number;
}

export interface SearchFormData {
  _id?: string;
  searchFormCode: string;
  searchFormName: string;
  searchFormFields: SearchFormField[];
  searchFormConfig?: SearchFormConfig;
}
