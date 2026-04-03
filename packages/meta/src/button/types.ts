/** 按钮级别枚举 */
export enum ButtonLevel {
  View = 'View',
  List = 'List',
  ListRow = 'ListRow',
  DetailPage = 'DetailPage',
}

/** 按钮事件类型枚举 */
export enum ButtonEventType {
  System = 'System',
  Custom = 'Custom',
}

/** 按钮事件枚举 */
export enum ButtonEvent {
  Create = 'Create',
  Update = 'Update',
  Delete = 'Delete',
  Export = 'Export',
  Import = 'Import',
  BatchDelete = 'BatchDelete',
  BatchUpdate = 'BatchUpdate',
}

/** 操作按钮 */
export interface ActionButton {
  _id?: string;
  buttonCode: string;
  buttonName: string;
  buttonOrder: number;
  buttonLevel: string;
  buttonEventType: string;
  buttonEvent: string;
  buttonHelpTip?: string;
  buttonConfig?: Record<string, any>;
}

/** 功能按钮基础字段 */
export interface FunctionButtonBase {
  buttonName: string;
  buttonCode: string;
  buttonDesc?: string;
  buttonOrder?: number;
  buttonHelpType?: string;
  buttonHelpTip?: string;
  buttonHelpLink?: string;
  buttonLevel: ButtonLevel;
  buttonEventType: ButtonEventType;
  buttonEvent: string;
  buttonConfig?: Record<string, any>;
}
