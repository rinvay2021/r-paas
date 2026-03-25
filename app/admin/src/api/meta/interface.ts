import { Form } from 'antd';

/** ==================== common start ==================== */
/** 分页查询DTO */
export interface PaginationQuery {
  /** 页码 */
  page?: number;
  /** 每页条数 */
  pageSize?: number;
}
/** ==================== common end ==================== */

/** ==================== 应用 start ==================== */
/** 应用 DTO */
export interface AppDto {
  /** id */
  _id?: string;
  /** 应用编码 */
  appCode: string;
  /** 应用名称 */
  appName?: string;
  /** 应用描述 */
  appDesc?: string;
}

/** 查询应用 DTO */
export type QueryAppDto = Partial<AppDto & PaginationQuery>;
/** ==================== 应用 end ==================== */

/** ==================== 元对象 start ==================== */
/** 元对象 DTO */
export interface MetaObjectDto {
  /** id */
  _id?: string;
  /** 应用编码 */
  appCode: string;
  /** 元数据对象编码 */
  metaObjectCode: string;
  /** 元数据对象名称 */
  metaObjectName: string;
  /** 元数据对象描述 */
  metaObjectDesc?: string;
}

/** 查询元对象 DTO */
export type QueryMetaObjectDto = Partial<MetaObjectDto & PaginationQuery>;
/** ==================== 元对象 end ==================== */

/** ==================== 字段 start ==================== */
/** 字段 DTO */
export interface FieldDto {
  /** id */
  _id?: string;
  /** 字段编码 */
  fieldCode?: string;
  /** 字段名称 */
  fieldName?: string;
  /** 字段类型 */
  fieldType?: string;
  /** 字段描述 */
  fieldDesc?: string;
  /** 应用编码 */
  appCode: string;
  /** 元数据对象编码 */
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
  /** 帮助设置 */
  helpSettings?: Record<string, string>;
  /** 布局设置 */
  layoutSettings?: Parameters<typeof Form>[0] & { columns: number };
  /** 联动设置（直接是数组） */
  linkageSettings?: Array<{
    id: string;
    condition: {
      field: string;
      operator: string;
      value: any;
    };
    actions: {
      show?: string[];
      hide?: string[];
      require?: string[];
      unrequire?: string[];
      readonly?: string[];
      editable?: string[];
      clear?: string[];
    };
  }>;
};

/** 表单容器 */
export type ContainerType = {
  /** id */
  id: string;
  /** 标题 */
  title?: string;
  /** 列数 */
  columns?: number;
  /** 创建模式 */
  createMode?: string;
  /** 编辑模式 */
  editMode?: string;
  /** 视图模式 */
  viewMode?: string;
  /** 是否隐藏 */
  isHidden?: boolean;
  /** 字段 */
  fields?: FieldDto[];
};

/** 表单 DTO */
export interface FormDto {
  /** id */
  _id?: string;
  /** 表单编码 */
  formCode: string;
  /** 表单名称 */
  formName: string;
  /** 表单描述 */
  formDesc?: string;
  /** 应用编码 */
  appCode: string;
  /** 元数据对象编码 */
  metaObjectCode: string;
  /** 表单配置 */
  formConfig?: FormConfig;
  /** 表单容器 */
  containers?: ContainerType[];
}

/** 查询表单 DTO */
export type QueryFormDto = Partial<FormDto & PaginationQuery>;

/** 更新表单 DTO */
export type UpdateFormDto = Partial<FormDto>;
/** ==================== 表单 end ==================== */

/** ==================== 列表 start ==================== */
/** 列表配置 */
export interface ListConfig {
  /** 冻结操作列 */
  frozenColumn?: boolean;
  /** 显示操作列 */
  showActions?: boolean;
  /** 显示勾选框 */
  showCheckbox?: boolean;
  /** 显示序号 */
  showIndex?: boolean;
  /** 左侧冻结列数量 */
  frozenColumnNum?: number;
  /** 每页显示数据 */
  pageSize?: number;

  /** 帮助设置 */
  helpSettings?: Record<string, string>;
}
/** 列表字段DTO */
export interface ListFieldDto {
  /** 排序 */
  sort: number;
  /** 字段名称 */
  name: string;
  /** 显示名称 */
  displayName: string;
  /** 是否显示 */
  isVisible: boolean;
  /** 显示帮助 */
  showHelp: boolean;
  /** 帮助提示 */
  helpTip: string;
  /** 宽度 */
  width: number;
  /** 对齐方式 */
  align: string;
  /** 字段类型 */
  field: FieldDto;
}

/** 列表DTO */
export interface ListDto {
  /** id */
  _id?: string;
  /** 应用编码 */
  appCode: string;
  /** 元数据对象编码 */
  metaObjectCode: string;
  /** 列表编码 */
  listCode: string;
  /** 列表名称 */
  listName: string;
  /** 列表描述 */
  listDesc?: string;
  /** 列表配置 */
  listConfig?: ListConfig;
  /** 列表按钮 */
  buttons?: any[];
  /** 列表字段 */
  listFields: ListFieldDto[];
}

/** 查询列表 DTO */
export type QueryListDto = Partial<ListDto & PaginationQuery>;

/** 更新列表 DTO */
export type UpdateListDto = Partial<ListDto>;
/** ==================== 列表 end ==================== */

/** ==================== 详情页 start ==================== */
/** 详情页配置 */
export type DetailPageConfig = {
  helpSettings?: Record<string, string>;
};

/** 详情页容器类型 */
export type DetailPageContainerType = 'MAIN_OBJECT' | 'SUB_OBJECT';

/** 详情页页面显示类型 */
export type DetailPagePageType = 'TagTiled' | 'OnePage';

/** 详情页关联组件类型 */
export type DetailPageComponentType = 'List' | 'View';

/** 详情页主对象容器 */
export type DetailPageMainObjectContainer = {
  type: DetailPageContainerType;
  /** 基础表单 */
  formCode: string;
  /** 页面显示类型：标签平铺 / 一页展示 */
  pageType?: DetailPagePageType;
  /** 功能按钮 */
  buttons?: any[];
};

/** 详情页子对象容器 */
export type DetailPageSubObjectContainer = {
  type: DetailPageContainerType;
  /** 关联对象 */
  metaObjectCode?: string;
  /** 标题 */
  title?: string;
  /** 关联组件：列表/视图 */
  componentType?: DetailPageComponentType;
  /** 组件 */
  component: string;
  /** 编码 */
  componentCode?: string;
  /** 排序 */
  order?: number;
  /** 是否展示 */
  isVisible?: boolean;
  /** 功能按钮 */
  buttons?: any[];
};

/** 详情页容器 */
export type DetailPageContainer = DetailPageMainObjectContainer | DetailPageSubObjectContainer;

/** 详情页 DTO */
export interface DetailPageDto {
  /** 唯一id */
  _id?: string;
  /** 详情页编码 */
  detailPageCode: string;
  /** 详情页名称 */
  detailPageName: string;
  /** 详情页描述 */
  detailPageDesc?: string;
  /** 表单编码 */
  formCode: string;
  /** 应用编码 */
  appCode: string;
  /** 对象编码 */
  metaObjectCode: string;
  /** 对象 */
  containers?: DetailPageContainer[];
  /** 详情页配置 */
  detailPageConfig?: DetailPageConfig;
}

/** 查询详情页 DTO */
export type QueryDetailPageDto = Partial<DetailPageDto & PaginationQuery>;

/** 更新详情页 DTO */
export type UpdateDetailPageDto = Partial<DetailPageDto>;
/** ==================== 详情页 end ==================== */

/** ==================== 搜索表单 start ==================== */
/** 搜索表单配置 */
export interface SearchFormConfig {
  /** 是否可折叠 */
  isCollapsible?: boolean;
  /** 折叠行数 */
  collapseRows?: number;
}

/** 搜索表单字段 */
export interface SearchFormFieldDto {
  /** 字段名称 */
  fieldName: string;
  /** 显示名称 */
  displayName?: string;
  /** 查询条件 */
  condition: string;
  /** 默认值选择方式：custom-自定义，system-系统输入 */
  defaultValueType?: 'custom' | 'system';
  /** 默认值 */
  defaultValue?: string;
  /** 提示语 */
  placeholder?: string;
  /** 是否显示 */
  isVisible?: boolean;
}

/** 搜索表单 DTO */
export interface SearchFormDto {
  /** id */
  _id?: string;
  /** 应用编码 */
  appCode: string;
  /** 元数据对象编码 */
  metaObjectCode: string;
  /** 搜索表单编码 */
  searchFormCode: string;
  /** 搜索表单名称 */
  searchFormName: string;
  /** 搜索表单描述 */
  searchFormDesc?: string;
  /** 搜索表单配置 */
  searchFormConfig?: SearchFormConfig;
  /** 搜索表单字段 */
  searchFormFields: SearchFormFieldDto[];
}

/** 查询搜索表单 DTO */
export type QuerySearchFormDto = Partial<SearchFormDto & PaginationQuery>;

/** 更新搜索表单 DTO */
export type UpdateSearchFormDto = Partial<SearchFormDto>;
/** ==================== 搜索表单 end ==================== */

/** ==================== 视图 start ==================== */
/** 视图配置 */
export interface ViewConfig {
  /** 帮助设置 */
  helpSettings?: Record<string, string>;
}
/** 视图 DTO */
export interface ViewDto {
  /** id */
  _id?: string;
  /** 应用编码 */
  appCode: string;
  /** 元数据对象编码 */
  metaObjectCode: string;
  /** 视图编码 */
  viewCode: string;
  /** 视图名称 */
  viewName: string;
  /** 视图描述 */
  viewDesc?: string;
  /** 列表编码 */
  listCode: string;
  /** 搜索表单编码 */
  searchFormCode: string;
  /** 功能按钮 */
  buttons?: any[];
  /** 视图配置 */
  viewConfig?: ViewConfig;
}

/** 查询视图 DTO */
export type QueryViewDto = Partial<ViewDto & PaginationQuery>;

/** 更新视图 DTO */
export type UpdateViewDto = Partial<ViewDto>;
/** ==================== 视图 end ==================== */

/** ==================== 操作按钮 start ==================== */
/** 操作按钮 DTO */
export interface ActionButtonDto {
  /** id */
  _id?: string;
  /** 应用编码 */
  appCode: string;
  /** 元数据对象编码 */
  metaObjectCode: string;
  /** 操作按钮编码 */
  buttonCode: string;
  /** 操作按钮名称 */
  buttonName: string;
  /** 操作按钮描述 */
  buttonDesc?: string;
  /** 排序 */
  buttonOrder: number;
  /** 帮助类型 */
  buttonHelpType?: string;
  /** 帮助提示 */
  buttonHelpTip?: string;
  /** 帮助链接 */
  buttonHelpLink?: string;
  /** 级别 */
  buttonLevel: string;
  /** 事件类型 */
  buttonEventType: string;
  /** 事件 */
  buttonEvent: string;
  /** 配置 */
  buttonConfig?: any;
}

/** 查询操作按钮 DTO */
export interface QueryActionButtonDto extends Partial<ActionButtonDto & PaginationQuery> {
  keyword?: string;
}

/** 更新操作按钮 DTO */
export type UpdateActionButtonDto = Partial<ActionButtonDto>;
/** ==================== 操作按钮 end ==================== */

/** ==================== 菜单 start ==================== */
/** 菜单 DTO */
export interface MenuDto {
  /** id */
  _id?: string;
  /** 应用编码 */
  appCode: string;
  /** 菜单名称 */
  menuName: string;
  /** 菜单编码 */
  menuCode: string;
  /** 菜单描述 */
  menuDesc?: string;
  /** 父菜单ID */
  parentId?: string | null;
  /** 关联视图编码 */
  viewCode?: string;
  /** 排序号 */
  orderNum: number;
  /** 层级 */
  level: number;
  /** 是否删除 */
  isDelete?: boolean;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

/** 查询菜单 DTO */
export interface QueryMenuDto {
  /** 应用编码 */
  appCode: string;
}

/** 更新菜单 DTO */
export type UpdateMenuDto = Partial<MenuDto> & {
  _id: string;
};

/** 菜单位置信息 DTO */
export interface MenuPositionDto {
  /** 菜单ID */
  _id: string;
  /** 父菜单ID */
  parentId?: string | null;
  /** 排序号 */
  orderNum: number;
}

/** 保存菜单列表 DTO */
export interface SaveMenuListDto {
  /** 应用编码 */
  appCode: string;
  /** 菜单位置信息列表 */
  menus: MenuPositionDto[];
}
/** ==================== 菜单 end ==================== */
