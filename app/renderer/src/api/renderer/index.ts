import { http } from '@/request';
import type {
  RenderFormResponse,
  RenderViewResponse,
} from './interface';

export const rendererApi = {
  getForm(params: { appCode: string; metaObjectCode: string; formCode: string }) {
    return http.post<RenderFormResponse>('/renderer/form', params);
  },
  getView(params: { appCode: string; metaObjectCode: string; viewCode: string }) {
    return http.post<RenderViewResponse>('/renderer/view', params);
  },
  getDetail(params: { appCode: string; metaObjectCode: string; detailPageCode: string }) {
    return http.post<import('@r-paas/meta').DetailPageData>('/renderer/detail', params);
  },
  getList(params: { appCode: string; metaObjectCode: string; listCode: string }) {
    return http.post<{ list: import('@r-paas/meta').ListData }>('/renderer/list', params);
  },
  getSearchForm(params: { appCode: string; metaObjectCode: string; searchFormCode: string }) {
    return http.post<{ searchForm: import('@r-paas/meta').SearchFormData }>('/renderer/search-form', params);
  },
};
