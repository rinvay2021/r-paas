import type { FieldDto, FormDto, ContainerType, FormConfig } from '@/api/meta/interface';

export interface FormConfigProps {
  config: FormConfig;
  onChange: (values: Partial<FormConfig>) => void;
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
  container: ContainerType;
  field: FieldDto;
}

export interface ConfigPanelProps {
  formConfig: FormConfig;
  containers: ContainerType[];
  selectedForm: boolean;
  selectedContainer: ContainerType;
  selectedField: FieldSelected | null;
  onFormConfigChange: (values: Partial<FormConfig>) => void;
  onContainerChange: (containerId: string, values: Partial<ContainerType>) => void;
  onFieldChange: (containerId: string, fieldId: string, values: Partial<FieldDto>) => void;
}

export type FormDesignerProps = {
  refresh: () => void;
  height: number;
  activeForm: FormDto;
};

export interface ContainerProps {
  index: number;
  container: ContainerType;
  containers?: ContainerType[];
  isSelectedContainer?: boolean;
  selectedField?: FieldSelected;
  onSelectField: (params: FieldSelected) => void;
  onSelectContainer: (container: ContainerType) => void;
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
