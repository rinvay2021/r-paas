import type { ActionButton } from '../button';

export interface ViewData {
  _id?: string;
  viewCode: string;
  viewName: string;
  listCode: string;
  searchFormCode: string;
  buttons?: ActionButton[];
  viewConfig?: Record<string, any>;
}
