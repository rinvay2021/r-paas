import { http } from '@/request';
import type {
  StatisticsData,
  TrendData,
  HotObject,
  RecentActivity,
  HealthCheckResult,
  ObjectOverview,
} from '@/pages/dashboard/types';

export interface BaseResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface ListResponse<T> {
  list: T[];
  total: number;
}

export const dashboardService = {
  /** 获取统计数据 */
  getStatistics: (params: { appCode?: string }) => {
    return http.get<BaseResponse<StatisticsData>>('/dashboard/statistics', { params });
  },

  /** 获取趋势数据 */
  getTrend: (params: { appCode?: string; days?: number }) => {
    return http.get<BaseResponse<TrendData>>('/dashboard/trend', { params });
  },

  /** 获取热门对象 */
  getHotObjects: (params: { appCode?: string; limit?: number }): Promise<any> => {
    return http.get<BaseResponse<ListResponse<HotObject>>>('/dashboard/hot-objects', { params });
  },

  /** 获取最近操作 */
  getRecentActivities: (params: { appCode?: string; limit?: number }): Promise<any> => {
    return http.get<BaseResponse<ListResponse<RecentActivity>>>('/dashboard/recent-activities', {
      params,
    });
  },

  /** 获取健康检查 */
  getHealthCheck: (params: { appCode?: string }) => {
    return http.get<BaseResponse<HealthCheckResult>>('/dashboard/health-check', { params });
  },

  /** 获取对象概览 */
  getObjectsOverview: (params: { appCode?: string }): Promise<any> => {
    return http.get<BaseResponse<ListResponse<ObjectOverview>>>('/dashboard/objects-overview', {
      params,
    });
  },
};
