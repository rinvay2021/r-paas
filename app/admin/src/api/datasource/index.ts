import { http } from '@/request';
import type {
  DatasourceDto,
  QueryDatasourceDto,
  UpdateDatasourceDto,
  DatasourceDetailDto,
} from './interface';

/**
 * 数据源服务
 */
export class DatasourceService {
  /**
   * 创建数据源
   */
  async createDatasource(data: DatasourceDto) {
    return await http.post<DatasourceDetailDto>('/datasource/create', data);
  }

  /**
   * 查询数据源列表
   */
  async queryDatasources(params: QueryDatasourceDto) {
    return await http.post<{ list: DatasourceDetailDto[]; total: number }>(
      '/datasource/list',
      params
    );
  }

  /**
   * 更新数据源
   */
  async updateDatasource(data: UpdateDatasourceDto) {
    return await http.post<DatasourceDetailDto>('/datasource/update', data);
  }

  /**
   * 删除数据源
   */
  async deleteDatasource(id: string) {
    return await http.post<{ success: boolean; message: string }>('/datasource/delete', { id });
  }

  /**
   * 查询数据源详情
   */
  async getDatasourceById(id: string) {
    return await http.post<DatasourceDetailDto>('/datasource/detail', { id });
  }
}

export const datasourceService = new DatasourceService();
