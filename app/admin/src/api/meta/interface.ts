/**
 * 分页查询参数
 */
export interface PaginationQuery {
  page: number;
  pageSize: number;
}

/**
 * 应用 DTO
 */
export interface AppDto {
  id?: string;
  appCode: string;
  appName?: string;
  appDesc?: string;
}

/**
 * 元对象 DTO
 */
export interface MetaObjectDto {
  id?: string;
  appCode: string;
  metaObjectCode: string;
  metaObjectName: string;
  metaObjectDesc?: string;
}

/**
 * 查询元对象 DTO
 */
export type QueryMetaObjectDto = Partial<MetaObjectDto & PaginationQuery>;

/**
 * 字段 DTO
 */
export interface FieldDto {
  _id?: string;
  fieldCode?: string;
  fieldName?: string;
  fieldType?: string;
  fieldDesc?: string;
  appCode: string;
  metaObjectCode: string;
}

/**
 * 查询字段 DTO
 */
export interface QueryFieldDto extends Partial<FieldDto & PaginationQuery> {
  keyword?: string;
}

/**
 * 更新字段 DTO
 */
export type UpdateFieldDto = Partial<FieldDto>;

/**
 * 表单 DTO
 */
export interface FormDto {
  formCode: string;
  formName: string;
  formDesc?: string;
  appCode: string;
  metaObjectCode: string;
  fields: any[];
  rules: any[];
  layout: Record<string, any>;
}

/**
 * 查询表单 DTO
 */
export type QueryFormDto = Partial<FormDto & PaginationQuery>;

/**
 * 更新表单 DTO
 */
export type UpdateFormDto = Partial<FormDto>;

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
 * 查询列表 DTO
 */
export type QueryListDto = Partial<ListDto & PaginationQuery>;

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
 * 查询详情页 DTO
 */
export type QueryDetailPageDto = Partial<DetailPageDto & PaginationQuery>;

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
 * 查询搜索表单 DTO
 */
export type QuerySearchFormDto = Partial<SearchFormDto & PaginationQuery>;

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
 * 查询视图 DTO
 */
export type QueryViewDto = Partial<ViewDto & PaginationQuery>;

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

/**
 * 查询操作按钮 DTO
 */
export interface QueryActionButtonDto extends Partial<ActionButtonDto & PaginationQuery> {
  keyword?: string;
}
