import { http, BASE_URL } from '@/request';

export { BASE_URL };

export const dataApi = {
  // ── 基础 CRUD ──────────────────────────────────────────

  create(params: { appCode: string; metaObjectCode: string; data: Record<string, any> }) {
    return http.post('/data/create', params);
  },

  detail(params: { appCode: string; metaObjectCode: string; id: string }) {
    return http.post<Record<string, any>>('/data/detail', params);
  },

  update(params: { appCode: string; metaObjectCode: string; id: string; data: Record<string, any> }) {
    return http.post('/data/update', params);
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

  query(params: {
    appCode: string;
    metaObjectCode: string;
    page?: number;
    pageSize?: number;
    searchParams?: Array<{ fieldCode: string; condition: string; value: any }>;
  }) {
    return http.post<{ list: any[]; total: number; page: number; pageSize: number }>('/data/query', params);
  },

  // ── 导出 ──────────────────────────────────────────────

  exportData(params: {
    appCode: string;
    metaObjectCode: string;
    listCode: string;
    scope: 'all' | 'selected';
    ids?: string[];
    searchParams?: Array<{ fieldCode: string; condition: string; value: any }>;
  }) {
    return http.post<{ taskId: string }>('/data/export', params);
  },

  // ── 模板下载 ──────────────────────────────────────────

  /**
   * 下载导入模板，返回完整 axios response（res.data 是 Blob）。
   * 使用 http.download 方法，自动设置 responseType: blob。
   */
  downloadTemplate(params: { appCode: string; metaObjectCode: string; listCode: string }) {
    return http.download('/data/import/template', params);
  },

  // ── 导入 ──────────────────────────────────────────────

  /**
   * 上传文件导入，使用 http.upload 方法。
   * FormData 的 Content-Type boundary 由请求拦截器自动处理。
   */
  importData(formData: FormData) {
    return http.upload<{ taskId: string }>('/data/import', formData);
  },

  // ── 任务 ──────────────────────────────────────────────

  getTasks(params: { appCode: string; metaObjectCode?: string }) {
    return http.post<{ list: any[] }>('/data/tasks', params);
  },

  getTask(taskId: string) {
    return http.get<any>(`/data/tasks/${taskId}`);
  },
};
