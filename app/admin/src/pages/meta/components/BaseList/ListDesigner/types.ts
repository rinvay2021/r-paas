import { ListConfig, ListDto } from '@/api/meta/interface';

export interface ListConfigProps {
  config: ListConfig;
  onChange: (values: Partial<ListConfig>) => void;
}

export type ListDesignerRef = {
  saveList: () => void;
};

export type ListDesignerProps = {
  refresh: () => void;
  height: number;
  activeList: ListDto;
};
