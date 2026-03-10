import { ViewDto } from '@/api/meta/interface';

export interface ViewDesignerRef {
  getFormData: () => Promise<any>;
}

export interface ViewDesignerProps {
  height: number;
  activeView?: ViewDto;
}
