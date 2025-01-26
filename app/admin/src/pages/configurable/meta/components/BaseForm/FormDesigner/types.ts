import type { FieldDto } from '@/api/meta/interface';

export interface FormDesignerProps {
  formCode: string;
  appCode: string;
  metaObjectCode: string;
}

export interface FormBaseConfig {
  title?: string;
  columns?: number;
  colon?: boolean;
  size?: 'small' | 'middle' | 'large';
  layout?: 'horizontal' | 'vertical' | 'inline';
  variant?: 'outlined' | 'borderless' | 'filled';
  labelWrap?: boolean;
  labelAlign?: 'left' | 'right';
}

export interface ContainerType {
  id: string;
  title?: string;
  fields?: FieldDto[];
  columns?: number;
}

export interface FieldProps {
  index: number;
  field: FieldDto;
  containerId: string;
  isSelectedField: boolean;
  onSelectField: () => void;
  onDeleteField: () => void;
  onMoveField: (
    dragIndex: number,
    hoverIndex: number,
    sourceContainerId: string,
    targetContainerId: string,
    draggedField: FieldDto
  ) => void;
}

export interface FieldSelected {
  containerId: string;
  fieldId: string;
}

export interface ContainerProps {
  index: number;
  container: ContainerType;
  containers?: ContainerType[];
  isSelectedContainer?: boolean;
  selectedField?: FieldSelected;
  onSelectField: (params: FieldSelected) => void;
  onSelectContainer: (containerId: string) => void;
  onRemoveContainer: (containerId: string) => void;
  onUpdateField: (containerId: string, fields: FieldDto[]) => void;
  onMoveContainer: (dragIndex: number, hoverIndex: number) => void;
}

export type { FieldDto };
