import { http } from '@/request';
import type { QueryPortalAppDto, QueryPortalMenuDto, PortalApp, PortalMenu } from './interface';

export class PortalService {
  async queryApps(params: QueryPortalAppDto = {}) {
    return await http.post<{ list: PortalApp[]; total: number }>('/portal/app/list', params);
  }

  async queryMenus(params: QueryPortalMenuDto) {
    return await http.post<{ list: PortalMenu[]; total: number }>('/portal/menu/list', params);
  }
}

export const portalService = new PortalService();
