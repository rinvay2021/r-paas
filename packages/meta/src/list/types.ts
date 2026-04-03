import type { FieldInfo } from '../field/types';
import type { ActionButton } from '../button/types';

export interface ListFieldItem {
  sort: number;
  name: string;
  displayName: string;
  isVisible: boolean;
  showHelp?: boolean;
  helpTip?: string;
  helpText?: string;
  width?: number;
  align?: string;
  field: FieldInfo;
}

export interface ListConfig {
  frozenColumn?: boolean;
  showActions?: boolean;
  showCheckbox?: boolean;
  showIndex?: boolean;
  frozenColumnNum?: number;
  pageSize?: number;
  buttons?: ActionButton[];
}

export interface ListData {
  _id?: string;
  listCode: string;
  listName: string;
  listFields: ListFieldItem[];
  listConfig?: ListConfig;
}
