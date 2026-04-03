import { HelpType, TipType } from './types';

export const HELP_TYPE_OPTIONS = [
  { label: '帮助提示', value: HelpType.TOOLTIP },
  { label: '帮助提示+链接', value: HelpType.LINK },
];

export const TIP_TYPE_OPTIONS = [
  { label: '信息', value: TipType.INFO },
  { label: '警告', value: TipType.WARNING },
  { label: '错误', value: TipType.ERROR },
  { label: '成功', value: TipType.SUCCESS },
];

export const HELP_SETTINGS_DEFAULT_VALUE: import('./types').HelpSettingsValue = {
  type: TipType.INFO,
  tipType: [],
  tooltip: '',
  linkUrl: '',
  linkText: '',
};
