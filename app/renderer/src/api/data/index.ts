import { http } from '@/request';

export const dataApi = {
  create(params: { appCode: string; metaObjectCode: string; data: Record<string, any> }) {
    return http.post('/data/create', params);
  },
  delete(params: { appCode: string; metaObjectCode: string; id: string }) {
    return http.post('/data/delete', params);
  },
  batchDelete(params: { appCode: string; metaObjectCode: string; ids: string[] }) {
    return http.post('/data/batch-delete', params);
  },
  batchUpdate(params: { appCode: string; metaObjectCode: string; ids: string[]; data: Record<string, any> }) {
    return http.post('/data/batch-update', params);
  },
  detail(params: { appCode: string; metaObjectCode: string; id: string }) {
    return http.post<Record<string, any>>('/data/detail', params);
  },
  update(params: { appCode: string; metaObjectCode: string; id: string; data: Record<string, any> }) {
    return http.post('/data/update', params);
  },
  query(params: {
    appCode: string;
    metaObjectCode: string;
    page?: number;
    pageSize?: number;
    searchParams?: Array<{ fieldCode: string; condition: string; value: any }>;
  }) {
    return http.post<{ list: any[]; total: number; page: number; pageSize: number }>('/data/query', params);
  },
};
