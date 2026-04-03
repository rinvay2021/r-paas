import { http } from '@/request';
import type {
  RenderFormResponse,
  RenderViewResponse,
  RenderDetailResponse,
} from './interface';

export const rendererApi = {
  getForm(params: { appCode: string; metaObjectCode: string; formCode: string }) {
    return http.post<RenderFormResponse>('/renderer/form', params);
  },
  getView(params: { appCode: string; metaObjectCode: string; viewCode: string }) {
    return http.post<RenderViewResponse>('/renderer/view', params);
  },
  getDetail(params: { appCode: string; metaObjectCode: string; detailPageCode: string }) {
    return http.post<RenderDetailResponse>('/renderer/detail', params);
  },
};
