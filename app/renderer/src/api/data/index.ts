import { http } from '@/request';

export const dataApi = {
  create(params: { appCode: string; metaObjectCode: string; data: Record<string, any> }) {
    return http.post('/data/create', params);
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
