// 从 @r-paas/meta 导入公共类型
export type {
  FieldConfig,
  FieldInfo,
  ContainerField,
  FormContainer,
  LinkageCondition,
  LinkageAction,
  LinkageSetting,
  FormConfig,
  FormData,
  ListFieldItem,
  ListConfig,
  ListData,
  SearchFormField,
  SearchFormConfig,
  SearchFormData,
  ViewData,
  ActionButton,
  DetailPageContainer,
  DetailPageData,
} from '@r-paas/meta';

// ── renderer 私有响应类型 ─────────────────────────────────
export interface RenderFormResponse {
  form: import('@r-paas/meta').FormData;
}

export interface RenderViewResponse {
  view: import('@r-paas/meta').ViewData;
  list: import('@r-paas/meta').ListData | null;
  searchForm: import('@r-paas/meta').SearchFormData | null;
}

export interface RenderDetailResponse extends import('@r-paas/meta').DetailPageData {}
