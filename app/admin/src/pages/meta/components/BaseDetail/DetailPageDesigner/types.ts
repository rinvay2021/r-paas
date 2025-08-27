import { DetailPageDto } from '@/api/meta/interface';

export type DetailPageDesignerRef = {
  saveDetail: () => void;
};

export type DetailPageDesignerProps = {
  refresh: () => void;
  height: number;
  activeDetail: DetailPageDto;
};
