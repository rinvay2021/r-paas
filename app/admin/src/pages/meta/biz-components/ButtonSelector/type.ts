import { ActionButtonDto } from '@/api/meta/interface';

export interface ButtonSelectorValue {
  buttons?: ActionButtonDto[];
}

export interface ButtonSelectorModalProps {
  children: React.ReactNode;
  value?: ActionButtonDto[];
  onChange?: (buttons: ActionButtonDto[]) => void;
}
