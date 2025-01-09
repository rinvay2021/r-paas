import React from 'react';
import { map, forEach } from 'lodash';
import { useRequest } from 'ahooks';
import { CrownFilled } from '@ant-design/icons';
import { getAppList, AppListItem } from '@/api/layouts'; // 假设这是获取应用列表的 API
import { SUB_MENU_TYPES } from '@/constant';

interface RouteItem {
  path: string;
  name: string;
  component?: string;
  routes?: RouteItem[];
  icon?: React.ReactNode;
}

function generateRoutes(appList: AppListItem[]): RouteItem[] {
  return [
    {
      path: '/dashboard',
      name: '控制台',
      icon: <CrownFilled />,
      component: './Welcome',
    },
    ...map(appList, app => {
      const parentRoute: RouteItem = {
        path: `/${app.appId}`,
        name: app.appName,
        icon: <CrownFilled />,
        routes: [],
      };

      forEach(SUB_MENU_TYPES, ({ name, route }) => {
        parentRoute.routes!.push({
          path: `/${app.appId}/${route}`,
          name: name,
          icon: <CrownFilled />,
        });
      });

      return parentRoute;
    }),
  ];
}

export function useMenus() {
  const { data, loading } = useRequest(getAppList, {
    manual: false,
    refreshDeps: [],
    cacheKey: 'menu-app-list',
  });

  const routes = React.useMemo(() => {
    return generateRoutes(data?.data);
  }, [data]);

  return {
    route: { path: '/', routes },
    loading,
  };
}
