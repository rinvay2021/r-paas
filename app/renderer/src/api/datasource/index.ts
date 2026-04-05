import { http } from '@/request';

export const datasourceApi = {
  /** 批量获取数据源选项，返回 Record<datasourceCode, {label,value}[]> */
  batchOptions(params: { appCode: string; datasourceCodes: string[] }) {
    return http.post<Record<string, { label: string; value: string }[]>>(
      '/datasource/batch-options',
      params,
    );
  },
};
