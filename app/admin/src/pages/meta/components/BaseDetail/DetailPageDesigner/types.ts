import { DetailPageConfig, DetailPageDto } from '@/api/meta/interface';

export interface DetailPageConfigProps {
  config: DetailPageConfig;
  onChange: (values: Partial<DetailPageConfig>) => void;
}

export type DetailPageDesignerRef = {
  saveDetail: () => void;
};

export type DetailPageDesignerProps = {
  refresh: () => void;
  height: number;
  activeDetail: DetailPageDto;
};
