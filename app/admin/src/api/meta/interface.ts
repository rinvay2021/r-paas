import { Form } from 'antd';

/** 分页查询参数 */
export interface PaginationQuery {
  page: number;
  pageSize: number;
}

/** ==================== 应用 start ==================== */

/** 应用 DTO */
export interface AppDto {
  id?: string;
  appCode: string;
  appName?: string;
  appDesc?: string;
}

/** 查询应用 DTO */
export type QueryAppDto = Partial<AppDto & PaginationQuery>;

/** ==================== 应用 end ==================== */

/** ==================== 元对象 start ==================== */

/** 元对象 DTO */
export interface MetaObjectDto {
  id?: string;
  appCode: string;
  metaObjectCode: string;
  metaObjectName: string;
  metaObjectDesc?: string;
}

/** 查询元对象 DTO */
export type QueryMetaObjectDto = Partial<MetaObjectDto & PaginationQuery>;

/** ==================== 元对象 end ==================== */

/** ==================== 字段 start ==================== */

/** 字段 DTO */
export interface FieldDto {
  _id?: string;
  fieldCode?: string;
  fieldName?: string;
  fieldType?: string;
  fieldDesc?: string;
  appCode: string;
  metaObjectCode: string;
}

/** 查询字段 DTO */
export interface QueryFieldDto extends Partial<FieldDto & PaginationQuery> {
  keyword?: string;
}

/** 更新字段 DTO */
export type UpdateFieldDto = Partial<FieldDto>;

/** ==================== 字段 end ==================== */

/** ==================== 表单 start ==================== */

/** 表单布局 */
export type FormConfig = {
  layoutSettings?: Parameters<typeof Form>[0] & { columns: number };
  helpSettings?: Record<string, string>;
  // TODO: 联动设置
  linkageSettings?: Record<string, string>[];
};

/** 表单容器 */
export type ContainerType = {
  id: string;
  title?: string;
  columns?: number;
  createMode?: string;
  editMode?: string;
  viewMode?: string;
  isHidden?: boolean;
  fields?: FieldDto[];
};

/** 表单 DTO */
export interface FormDto {
  _id?: string;
  formCode: string;
  formName: string;
  formDesc?: string;
  appCode: string;
  metaObjectCode: string;
  formConfig?: FormConfig;
  containers?: ContainerType[];
}

/** 查询表单 DTO */
export type QueryFormDto = Partial<FormDto & PaginationQuery>;

/** 更新表单 DTO */
export type UpdateFormDto = Partial<FormDto>;

/** ==================== 表单 end ==================== */

/** ==================== 列表 start ==================== */

/** 列表 DTO */
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

/** 查询列表 DTO */
export type QueryListDto = Partial<ListDto & PaginationQuery>;

/** ==================== 列表 end ==================== */

/** ==================== 详情页 start ==================== */

/** 详情页配置 */
export type DetailPageConfig = {
  helpSettings?: Record<string, string>;
};

/** 详情页容器 */
export type DetailPageContainer = DetailPageMainObjectContainer | DetailPageSubObjectContainer;

/** 详情页容器类型 */
export type DetailPageContainerType = 'MAIN_OBJECT' | 'SUB_OBJECT';

/** 详情页页面显示类型 */
export type DetailPagePageType = 'TAG' | 'ONE_PAGE';

/** 详情页关联组件类型 */
export type DetailPageComponentType = 'LIST' | 'VIEW';

/** 详情页主对象容器 */
export type DetailPageMainObjectContainer = {
  type: DetailPageContainerType;
  /** 基础表单 */
  formCode: string;
  /** 页面显示类型：标签平铺 / 一页展示 */
  pageType: DetailPagePageType;
  /** 功能按钮 */
  buttons?: any[];
};

/** 详情页子对象容器 */
export type DetailPageSubObjectContainer = {
  type: DetailPageContainerType;
  /** 关联对象 */
  objectCode: string;
  /** 标题 */
  title: string;
  /** 关联组件：列表/视图 */
  componentType: DetailPageComponentType;
  /** 组件 */
  component: string;
  /** 排序 */
  order: number;
  /** 功能按钮 */
  buttons?: any[];
};

/** 详情页 DTO */
export interface DetailPageDto {
  _id?: string;
  detailPageCode: string;
  detailPageName: string;
  formCode: string;
  detailPageDesc?: string;
  appCode: string;
  metaObjectCode: string;
  containers?: DetailPageContainer[];
  detailPageConfig?: DetailPageConfig;
}

/** 查询详情页 DTO */
export type QueryDetailPageDto = Partial<DetailPageDto & PaginationQuery>;

/** 更新详情页 DTO */
export type UpdateDetailPageDto = Partial<DetailPageDto>;

/** ==================== 详情页 end ==================== */

/** ==================== 搜索表单 start ==================== */

/** 搜索表单 DTO */
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

/** 查询搜索表单 DTO */
export type QuerySearchFormDto = Partial<SearchFormDto & PaginationQuery>;

/** ==================== 搜索表单 end ==================== */

/** ==================== 视图 start ==================== */

/** 视图 DTO */
export interface ViewDto {
  viewCode: string;
  viewName: string;
  objectCode: string;
  type: 'LIST' | 'DETAIL';
  config: any;
  description?: string;
}

/** 查询视图 DTO */
export type QueryViewDto = Partial<ViewDto & PaginationQuery>;

/** ==================== 视图 end ==================== */

/** ==================== 操作按钮 start ==================== */

/** 操作按钮 DTO */
export interface ActionButtonDto {
  buttonCode: string;
  buttonName: string;
  objectCode: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'CUSTOM';
  position: 'LIST' | 'DETAIL';
  config: any;
  description?: string;
}

/** 查询操作按钮 DTO */
export interface QueryActionButtonDto extends Partial<ActionButtonDto & PaginationQuery> {
  keyword?: string;
}

/** ==================== 操作按钮 end ==================== */
