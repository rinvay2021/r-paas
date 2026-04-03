import type { ReactNode } from 'react';

// 从 @r-paas/meta re-export，保持现有引用不变
export { HelpType, TipType } from '@r-paas/meta';

export interface HelpSettingsValue {
  type?: import('@r-paas/meta').TipType;
  tipType?: import('@r-paas/meta').HelpType[];
  tooltip?: string;
  linkUrl?: string;
  linkText?: string;
}

export interface HelpSettingsProps {
  children: ReactNode;
  value?: HelpSettingsValue;
  onChange?: (value: HelpSettingsValue) => void;
  modalTitle?: string;
  triggerProps?: Record<string, unknown>;
}
