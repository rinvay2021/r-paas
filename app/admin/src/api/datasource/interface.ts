export enum BooleanEnum {
  NO = 0,
  YES = 1,
}

export interface DatasourceOption {
  optionName: string;
  optionCode: string;
  isEnabled?: BooleanEnum;
}

export interface DatasourceDto {
  datasourceName: string;
  datasourceCode: string;
  datasourceDesc?: string;
  appCode: string;
  options: DatasourceOption[];
  isEnabled?: BooleanEnum;
}

export interface QueryDatasourceDto {
  appCode: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface UpdateDatasourceDto {
  _id: string;
  datasourceName?: string;
  datasourceDesc?: string;
  options?: DatasourceOption[];
  isEnabled?: BooleanEnum;
}

export interface DatasourceDetailDto {
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
