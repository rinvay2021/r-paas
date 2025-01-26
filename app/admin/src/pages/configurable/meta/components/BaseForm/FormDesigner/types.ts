import type { FieldDto } from '@/api/meta/interface';

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

// TODO
export interface FormBlockConfig {
  id: string;
  title?: string;
  fields?: FieldDto[];
  columns?: number;
}

// TODO
export interface FormFieldConfig {
  field: FieldDto;
  onChange: (values: Partial<FieldDto>) => void;
}

export interface FieldSelected {
  containerId: string;
  fieldId: string;
}

export interface ContainerType {
  id: string;
  title?: string;
  fields?: FieldDto[];
  columns?: number;
}

export interface ConfigPanelProps {
  formConfig: FormBaseConfig;
  containers: ContainerType[];
  selectedForm: boolean;
  selectedContainer: string | null;
  selectedField: FieldSelected | null;
  onFormConfigChange: (values: Partial<FormBaseConfig>) => void;
  onContainerChange: (containerId: string, values: Partial<ContainerType>) => void;
  onFieldChange: (containerId: string, fieldId: string, values: Partial<FieldDto>) => void;
}

export interface FormDesignerProps {
  formCode: string;
  appCode: string;
  metaObjectCode: string;
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

export type { FieldDto };
