import { http } from '@/request';
import type {
  AppDto,
  MetaObjectDto,
  FieldDto,
  FormDto,
  ListDto,
  DetailPageDto,
  SearchFormDto,
  ViewDto,
  ActionButtonDto,
  PaginationQuery,
} from './interface';

/**
 * 元数据服务
 */
export class MetaService {
  /**
   * 应用管理接口
   */
  async createApp(data: AppDto) {
    return http.post<AppDto>('/meta/app/create', data);
  }

  async queryApps(params: PaginationQuery) {
    return http.post<{ list: AppDto[]; total: number }>('/meta/app/list', params);
  }

  /**
   * 元对象管理接口
   */
  async createMetaObject(data: MetaObjectDto) {
    return http.post<MetaObjectDto>('/meta/object/create', data);
  }

  async queryMetaObjects(params: Partial<MetaObjectDto & PaginationQuery>) {
    return http.post<{ list: MetaObjectDto[]; total: number }>('/meta/object/list', params);
  }

  /**
   * 字段管理接口
   */
  async createField(data: FieldDto) {
    return http.post<FieldDto>('/meta/field/create', data);
  }

  async queryFields(params: PaginationQuery) {
    return http.post<{ list: FieldDto[]; total: number }>('/meta/field/list', params);
  }

  /**
   * 表单管理接口
   */
  async createForm(data: FormDto) {
    return http.post<FormDto>('/meta/form/create', data);
  }

  async queryForms(params: PaginationQuery) {
    return http.post<{ list: FormDto[]; total: number }>('/meta/form/list', params);
  }

  /**
   * 列表管理接口
   */
  async createList(data: ListDto) {
    return http.post<ListDto>('/meta/list/create', data);
  }

  async queryLists(params: PaginationQuery) {
    return http.post<{ list: ListDto[]; total: number }>('/meta/list/list', params);
  }

  /**
   * 详情页管理接口
   */
  async createDetailPage(data: DetailPageDto) {
    return http.post<DetailPageDto>('/meta/detail-page/create', data);
  }

  async queryDetailPages(params: PaginationQuery) {
    return http.post<{ list: DetailPageDto[]; total: number }>('/meta/detail-page/list', params);
  }

  /**
   * 搜索表单管理接口
   */
  async createSearchForm(data: SearchFormDto) {
    return http.post<SearchFormDto>('/meta/search-form/create', data);
  }

  async querySearchForms(params: PaginationQuery) {
    return http.post<{ list: SearchFormDto[]; total: number }>('/meta/search-form/list', params);
  }

  /**
   * 视图管理接口
   */
  async createView(data: ViewDto) {
    return http.post<ViewDto>('/meta/view/create', data);
  }

  async queryViews(params: PaginationQuery) {
    return http.post<{ list: ViewDto[]; total: number }>('/meta/view/list', params);
  }

  /**
   * 操作按钮管理接口
   */
  async createActionButton(data: ActionButtonDto) {
    return http.post<ActionButtonDto>('/meta/action-button/create', data);
  }

  async queryActionButtons(params: PaginationQuery) {
    return http.post<{ list: ActionButtonDto[]; total: number }>(
      '/meta/action-button/list',
      params
    );
  }
}

export const metaService = new MetaService();
