import { ViewDto } from '@/api/meta/interface';

export interface ViewDesignerRef {
  saveView: () => void;
}

export interface ViewDesignerProps {
  height: number;
  activeView?: ViewDto;
  refresh?: () => void;
}
