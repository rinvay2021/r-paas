import { HelpSettingsValue, HelpType, TipType } from './type';

export const defaultValue: HelpSettingsValue = {
  type: TipType.INFO,
  tipType: [],
  tooltip: undefined,
  linkUrl: undefined,
  linkText: undefined,
};

export const TIP_TYPE_OPTIONS = [
  { label: '信息', value: TipType.INFO },
  { label: '警告', value: TipType.WARNING },
  { label: '错误', value: TipType.ERROR },
  { label: '成功', value: TipType.SUCCESS },
];

export const HELP_TYPE_OPTIONS = [
  { label: '帮助提示', value: HelpType.TOOLTIP },
  { label: '链接', value: HelpType.LINK },
];
