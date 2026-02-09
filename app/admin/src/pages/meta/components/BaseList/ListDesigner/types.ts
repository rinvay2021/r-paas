import { ListConfig, ListDto, ListFieldDto } from '@/api/meta/interface';

export interface DragItem {
  index: number;
  id: string;
}

export interface DraggableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
}

export interface ListFieldEditorRef {
  getListFields: () => ListFieldDto[];
}

export interface ListConfigRef {
  getListConfig: () => ListConfig;
}

export interface ListConfigProps {
  config: ListConfig;
}

export type ListDesignerRef = {
  saveList: () => void;
};

export type ListDesignerProps = {
  refresh: () => void;
  height: number;
  activeList: ListDto;
};
