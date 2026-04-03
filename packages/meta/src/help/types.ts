/** 帮助类型 */
export enum HelpType {
  TOOLTIP = 'tooltip',
  LINK = 'link',
}

/** 提示类型 */
export enum TipType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

export interface HelpSettingsValue {
  type?: TipType;
  tipType?: HelpType[];
  tooltip?: string;
  linkUrl?: string;
  linkText?: string;
}
