import type { ReactNode } from 'react';

export enum HelpType {
  TOOLTIP = 'tooltip',
  LINK = 'link',
}

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

export interface HelpSettingsProps {
  children: ReactNode;
  value?: HelpSettingsValue;
  onChange?: (value: HelpSettingsValue) => void;
  modalTitle?: string;
  triggerProps?: Record<string, unknown>;
}
