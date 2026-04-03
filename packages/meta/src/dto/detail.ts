import type { ActionButton } from '../button';
import type { ListData } from './list';
import type { ViewData } from './view';
import type { SearchFormData } from './search-form';

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
