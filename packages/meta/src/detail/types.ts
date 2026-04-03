import type { ActionButton } from '../button/types';
import type { ListData } from '../list/types';
import type { ViewData } from '../view/types';
import type { SearchFormData } from '../search-form/types';

/** 详情页展示类型 */
export enum DetailPageType {
  TagTiled = 'TagTiled',
  OnePage = 'OnePage',
}

/** 详情页子对象组件类型 */
export enum DetailComponentType {
  List = 'List',
  View = 'View',
}

export interface DetailPageContainer {
  type: 'MAIN_OBJECT' | 'SUB_OBJECT';
  formCode?: string;
  pageType?: DetailPageType | string;
  metaObjectCode?: string;
  title?: string;
  componentType?: DetailComponentType | string;
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
