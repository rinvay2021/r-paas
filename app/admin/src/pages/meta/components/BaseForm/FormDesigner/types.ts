import type { FieldDto, FormDto, ContainerType, FormLayout } from '@/api/meta/interface';

export interface FormConfigProps {
  config: FormLayout;
  onChange: (values: Partial<FormLayout>) => void;
}

export interface FormBlockConfig {
  container: ContainerType;
  onChange: (values: Partial<Omit<ContainerType, 'fields'>>) => void;
}

export interface FormFieldConfig {
  label: string;
  displayModes: string[];
  required: boolean;
}

export interface FieldConfigProps {
  field: FormFieldConfig;
  onChange: (values: Partial<FormFieldConfig>) => void;
}

export interface FieldSelected {
  containerId: string;
  fieldId: string;
}

export interface ConfigPanelProps {
  formConfig: FormLayout;
  containers: ContainerType[];
  selectedForm: boolean;
  selectedContainer: string | null;
  selectedField: FieldSelected | null;
  onFormConfigChange: (values: Partial<FormLayout>) => void;
  onContainerChange: (containerId: string, values: Partial<ContainerType>) => void;
  onFieldChange: (containerId: string, fieldId: string, values: Partial<FieldDto>) => void;
}

export type FormDesignerProps = FormDto & {
  refresh: () => void;
};

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

export interface FormDesignerRef {
  saveForm: () => void;
}
