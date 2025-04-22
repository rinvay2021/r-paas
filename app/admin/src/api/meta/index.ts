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
  QueryMetaObjectDto,
  QueryFieldDto,
  QueryFormDto,
  QueryListDto,
  QueryDetailPageDto,
  QuerySearchFormDto,
  QueryViewDto,
  QueryActionButtonDto,
  UpdateFieldDto,
  UpdateFormDto,
} from './interface';

/**
 * 元数据服务
 */
export class MetaService {
  /**
   * 应用管理接口
   */
  async createApp(data: AppDto) {
    return await http.post<AppDto>('/meta/app/create', data);
  }

  async queryApps(params: PaginationQuery) {
    return await http.post<{ list: AppDto[]; total: number }>('/meta/app/list', params);
  }

  /**
   * 元对象管理接口
   */
  async createMetaObject(data: MetaObjectDto) {
    return await http.post<MetaObjectDto>('/meta/object/create', data);
  }

  async queryMetaObjects(params: QueryMetaObjectDto) {
    return await http.post<{ list: MetaObjectDto[]; total: number }>('/meta/object/list', params);
  }

  /**
   * 字段管理接口
   */
  async createField(data: FieldDto) {
    return await http.post<FieldDto>('/meta/field/create', data);
  }

  async queryFields(params: QueryFieldDto) {
    return await http.post<{ list: FieldDto[]; total: number }>('/meta/field/list', params);
  }

  async updateField(data: UpdateFieldDto) {
    return await http.post<FieldDto>('/meta/field/update', data);
  }

  async getFieldById(id: string) {
    return await http.post<FieldDto>('/meta/field/detail', { id });
  }

  /**
   * 表单管理接口
   */
  async createForm(data: FormDto) {
    return await http.post<FormDto>('/meta/form/create', data);
  }

  async queryForms(params: QueryFormDto) {
    return await http.post<{ list: FormDto[]; total: number }>('/meta/form/list', params);
  }

  async updateForm(data: UpdateFormDto) {
    return await http.post<FormDto>('/meta/form/update', data);
  }

  /**
   * 列表管理接口
   */
  async createList(data: ListDto) {
    return await http.post<ListDto>('/meta/list/create', data);
  }

  async queryLists(params: QueryListDto) {
    return await http.post<{ list: ListDto[]; total: number }>('/meta/list/list', params);
  }

  /**
   * 详情页管理接口
   */
  async createDetailPage(data: DetailPageDto) {
    return await http.post<DetailPageDto>('/meta/detail-page/create', data);
  }

  async queryDetailPages(params: QueryDetailPageDto) {
    return await http.post<{ list: DetailPageDto[]; total: number }>(
      '/meta/detail-page/list',
      params
    );
  }

  /**
   * 搜索表单管理接口
   */
  async createSearchForm(data: SearchFormDto) {
    return await http.post<SearchFormDto>('/meta/search-form/create', data);
  }

  async querySearchForms(params: QuerySearchFormDto) {
    return await http.post<{ list: SearchFormDto[]; total: number }>(
      '/meta/search-form/list',
      params
    );
  }

  /**
   * 视图管理接口
   */
  async createView(data: ViewDto) {
    return await http.post<ViewDto>('/meta/view/create', data);
  }

  async queryViews(params: QueryViewDto) {
    return await http.post<{ list: ViewDto[]; total: number }>('/meta/view/list', params);
  }

  /**
   * 操作按钮管理接口
   */
  async createActionButton(data: ActionButtonDto) {
    return await http.post<ActionButtonDto>('/meta/action-button/create', data);
  }

  async queryActionButtons(params: QueryActionButtonDto) {
    return await http.post<{ list: ActionButtonDto[]; total: number }>(
      '/meta/action-button/list',
      params
    );
  }
}

export const metaService = new MetaService();
