import { http } from '@/request';

export interface DataTask {
  _id: string;
  type: 'export' | 'import';
  appCode: string;
  metaObjectCode: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  fileUrl?: string;
  fileName?: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  errorDetails: Array<{ row: number; field?: string; message: string }>;
  errorMsg?: string;
  conflictStrategy?: 'skip' | 'upsert' | 'abort';
  createdAt: string;
}

export const taskApi = {
  getTasks(params: { appCode: string; metaObjectCode?: string }) {
    return http.post<{ list: DataTask[] }>('/data/tasks', params);
  },
  getTask(taskId: string) {
    return http.get<DataTask>(`/data/tasks/${taskId}`);
  },
  getDownloadUrl(fileUrl: string) {
    return `http://localhost:8080/api/v1${fileUrl}`;
  },
};
