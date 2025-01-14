/**
 * 分页查询参数
 */
export interface PaginationQuery {
  pageSize: number;
  current: number;
}

/**
 * 应用 DTO
 */
export interface AppDto {
  appCode: string;
  appName: string;
  description?: string;
}

/**
 * 元对象 DTO
 */
export interface MetaObjectDto {
  appCode: string;
  metaObjectCode: string;
  metaObjectName: string;
  metaObjectDesc?: string;
}

/**
 * 字段 DTO
 */
export interface FieldDto {
  fieldCode: string;
  fieldName: string;
  fieldType: string;
  objectCode: string;
  description?: string;
}

/**
 * 表单 DTO
 */
export interface FormDto {
  formCode: string;
  formName: string;
  objectCode: string;
  fields: Array<{
    fieldCode: string;
    required: boolean;
    order: number;
  }>;
  description?: string;
}

/**
 * 列表 DTO
 */
export interface ListDto {
  listCode: string;
  listName: string;
  objectCode: string;
  columns: Array<{
    fieldCode: string;
    order: number;
  }>;
  description?: string;
}

/**
 * 详情页 DTO
 */
export interface DetailPageDto {
  pageCode: string;
  pageName: string;
  objectCode: string;
  sections: Array<{
    sectionName: string;
    fields: Array<{
      fieldCode: string;
      order: number;
    }>;
    order: number;
  }>;
  description?: string;
}

/**
 * 搜索表单 DTO
 */
export interface SearchFormDto {
  formCode: string;
  formName: string;
  objectCode: string;
  fields: Array<{
    fieldCode: string;
    order: number;
  }>;
  description?: string;
}

/**
 * 视图 DTO
 */
export interface ViewDto {
  viewCode: string;
  viewName: string;
  objectCode: string;
  type: 'LIST' | 'DETAIL';
  config: any;
  description?: string;
}

/**
 * 操作按钮 DTO
 */
export interface ActionButtonDto {
  buttonCode: string;
  buttonName: string;
  objectCode: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'CUSTOM';
  position: 'LIST' | 'DETAIL';
  config: any;
  description?: string;
}
