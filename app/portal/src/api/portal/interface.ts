export interface PortalApp {
  _id?: string;
  appCode: string;
  appName: string;
  appDesc?: string;
  isEnabled?: number;
}

export interface PortalMenu {
  _id: string;
  appCode: string;
  menuName: string;
  menuCode: string;
  menuDesc?: string;
  parentId?: string | null;
  viewCode?: string;
  orderNum: number;
  level: number;
}

export interface QueryPortalAppDto {
  appCode?: string;
  appName?: string;
}

export interface QueryPortalMenuDto {
  appCode: string;
}
