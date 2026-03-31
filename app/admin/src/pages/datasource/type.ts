export enum BooleanEnum {
  NO = 0,
  YES = 1,
}

export interface DatasourceOption {
  optionName: string;
  optionCode: string;
  isEnabled: BooleanEnum;
}

export interface DatasourceListItem {
  _id: string;
  datasourceName: string;
  datasourceCode: string;
  datasourceDesc?: string;
  appCode: string;
  options: DatasourceOption[];
  isEnabled: BooleanEnum;
  createdAt: string;
  updatedAt: string;
}

export interface ColumnsOperators {
  handleEdit?: (record: DatasourceListItem) => void;
  handleDelete?: (record: DatasourceListItem) => void;
}

export interface DatasourceModalProps {
  id?: string;
  appCode: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onFinish: () => void;
}
