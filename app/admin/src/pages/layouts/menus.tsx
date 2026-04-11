import React from 'react';
import { map, forEach } from 'lodash';
import { useRequest } from 'ahooks';
import { CrownFilled, SettingOutlined } from '@ant-design/icons';
import { metaService } from '@/api/meta';
import { SUB_MENU_TYPES } from '@/constant';
import { AppDto } from '@/api/meta/interface';

interface RouteItem {
  path: string;
  name: string;
  component?: string;
  routes?: RouteItem[];
  icon?: React.ReactNode;
}

function generateRoutes(appList: AppDto[]): RouteItem[] {
  return [
    {
      path: '/dashboard',
      name: '控制台',
      icon: <CrownFilled />,
    },
    ...map(appList, app => {
      const parentRoute: RouteItem = {
        path: `/app/${app.appCode}`,
        name: app.appName,
        icon: <CrownFilled />,
        routes: [],
      };

      forEach(SUB_MENU_TYPES, ({ name, route }) => {
        parentRoute.routes!.push({
          path: `/app/${app.appCode}/${route}`,
          name: name,
          icon: <CrownFilled />,
        });
      });

      return parentRoute;
    }),
    {
      path: '/settings',
      name: '系统配置',
      icon: <SettingOutlined />,
    },
  ];
}

export function useMenus() {
  const { data, loading } = useRequest(metaService.queryApps, {
    manual: false,
    refreshDeps: [],
    cacheKey: 'menu-app-list',
  });

  const routes = React.useMemo(() => {
    return generateRoutes(data?.data?.list);
  }, [data]);

  return {
    route: { path: '/', routes },
    loading,
  };
}
