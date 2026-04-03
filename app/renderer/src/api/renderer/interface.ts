// ── 字段 ────────────────────────────────────────────────
export interface FieldConfig {
  inputType?: string;
  precision?: number;
  format?: string;
  showTime?: number;
  datasourceCode?: string;
  multiple?: number;
  options?: { label: string; value: string }[];
  [key: string]: any;
}

export interface FieldInfo {
  _id?: string;
  fieldCode: string;
  fieldName: string;
  fieldType: string;
  fieldDesc?: string;
  isEnabled?: number;
  config?: FieldConfig;
}

// ── 表单 ────────────────────────────────────────────────
export interface ContainerField extends FieldInfo {
  label?: string;
  required?: boolean;
  displayModes?: string[];
  isHidden?: boolean;
}

export interface FormContainer {
  id: string;
  title?: string;
  columns?: number;
  createMode?: string;
  editMode?: string;
  viewMode?: string;
  isHidden?: boolean;
  fields?: ContainerField[];
}

export interface LinkageCondition {
  field: string;
  operator: string;
  value: any;
}

export interface LinkageAction {
  show?: string[];
  hide?: string[];
  require?: string[];
  unrequire?: string[];
  readonly?: string[];
  editable?: string[];
  clear?: string[];
}

export interface LinkageSetting {
  id: string;
  condition: LinkageCondition;
  actions: LinkageAction;
}

export interface FormConfig {
  helpSettings?: Record<string, string>;
  layoutSettings?: Record<string, any>;
  linkageSettings?: LinkageSetting[];
}

export interface FormData {
  _id?: string;
  formCode: string;
  formName: string;
  formDesc?: string;
  appCode: string;
  metaObjectCode: string;
  containers?: FormContainer[];
  formConfig?: FormConfig;
}

// ── 列表 ────────────────────────────────────────────────
export interface ListFieldItem {
  sort: number;
  name: string;
  displayName: string;
  isVisible: boolean;
  showHelp?: boolean;
  helpTip?: string;
  width?: number;
  align?: string;
  field: FieldInfo;
}

export interface ListConfig {
  frozenColumn?: boolean;
  showActions?: boolean;
  showCheckbox?: boolean;
  showIndex?: boolean;
  frozenColumnNum?: number;
  pageSize?: number;
  buttons?: ActionButton[];
}

export interface ListData {
  _id?: string;
  listCode: string;
  listName: string;
  listFields: ListFieldItem[];
  listConfig?: ListConfig;
}

// ── 搜索表单 ─────────────────────────────────────────────
export interface SearchFormField {
  fieldName: string;
  displayName?: string;
  condition: string;
  defaultValueType?: 'custom' | 'system';
  defaultValue?: string;
  placeholder?: string;
  isVisible?: boolean;
  fieldInfo?: FieldInfo;
}

export interface SearchFormConfig {
  isCollapsible?: boolean;
  collapseRows?: number;
  cols?: number;
}

export interface SearchFormData {
  _id?: string;
  searchFormCode: string;
  searchFormName: string;
  searchFormFields: SearchFormField[];
  searchFormConfig?: SearchFormConfig;
}

// ── 视图 ────────────────────────────────────────────────
export interface ViewData {
  _id?: string;
  viewCode: string;
  viewName: string;
  listCode: string;
  searchFormCode: string;
  buttons?: ActionButton[];
  viewConfig?: Record<string, any>;
}

// ── 按钮 ────────────────────────────────────────────────
export interface ActionButton {
  _id?: string;
  buttonCode: string;
  buttonName: string;
  buttonOrder: number;
  buttonLevel: string;
  buttonEventType: string;
  buttonEvent: string;
  buttonHelpTip?: string;
  buttonConfig?: Record<string, any>;
}

// ── 详情页 ───────────────────────────────────────────────
export interface DetailPageContainer {
  type: 'MAIN_OBJECT' | 'SUB_OBJECT';
  formCode?: string;
  pageType?: 'TagTiled' | 'OnePage';
  metaObjectCode?: string;
  title?: string;
  componentType?: 'List' | 'View';
  component?: string;
  buttons?: ActionButton[];
  componentData?: ListData | { view: ViewData; list: ListData; searchForm: SearchFormData } | null;
}

export interface DetailPageData {
  _id?: string;
  detailPageCode: string;
  detailPageName: string;
  formCode: string;
  containers?: DetailPageContainer[];
  detailPageConfig?: Record<string, any>;
}

// ── API 响应 ─────────────────────────────────────────────
export interface RenderFormResponse {
  form: FormData;
}

export interface RenderViewResponse {
  view: ViewData;
  list: ListData | null;
  searchForm: SearchFormData | null;
}

export interface RenderDetailResponse {
  detailPage: DetailPageData;
  mainForm: FormData | null;
  buttons: ActionButton[];
}
