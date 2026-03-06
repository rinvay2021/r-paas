import { SearchFormConfig, SearchFormDto, SearchFormFieldDto } from '@/api/meta/interface';

export interface DragItem {
  index: number;
  id: string;
}

export interface DraggableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
}

export interface SearchFormFieldEditorRef {
  getSearchFormFields: () => SearchFormFieldDto[];
}

export interface SearchFormConfigRef {
  getSearchFormConfig: () => SearchFormConfig;
}

export interface SearchFormConfigProps {
  config?: SearchFormConfig;
}

export type SearchFormDesignerRef = {
  saveSearchForm: () => void;
};

export type SearchFormDesignerProps = {
  refresh: () => void;
  height: number;
  activeSearchForm: SearchFormDto;
};
