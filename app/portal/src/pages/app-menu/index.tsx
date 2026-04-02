import React from 'react';
import { Breadcrumb, Empty, Spin, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ProLayout } from '@ant-design/pro-components';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { useAuth } from '@/contexts/AuthContext';
import { portalService } from '@/api/portal';
import { prefix, LOGO, TITLE } from '@/constant';
import type { PortalMenu } from '@/api/portal/interface';

import './index.less';

function buildMenuTree(menus: PortalMenu[]) {
  const rootMenus = menus.filter(m => !m.parentId);
  const childMenus = menus.filter(m => !!m.parentId);

  return rootMenus.map(parent => {
    const children = childMenus.filter(
      c => String(c.parentId) === String(parent._id),
    );
    const item: any = {
      path: `/app/${parent.appCode}/menu/${parent.menuCode}`,
      name: parent.menuName,
    };
    if (children.length > 0) {
      item.routes = children.map(child => ({
        path: `/app/${child.appCode}/menu/${child.menuCode}`,
        name: child.menuName,
      }));
    }
    return item;
  });
}

// 取第一个叶子菜单名（有子菜单取第一个子项，否则取自身）
function getFirstLeafName(menus: PortalMenu[]): string | null {
  const roots = menus.filter(m => !m.parentId);
  if (!roots.length) return null;
  const firstRoot = roots[0];
  const children = menus.filter(m => String(m.parentId) === String(firstRoot._id));
  return children.length ? children[0].menuName : firstRoot.menuName;
}

const AppMenu: React.FC = () => {
  const { appCode } = useParams<{ appCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [selectedMenu, setSelectedMenu] = React.useState<string | null>(null);

  const { data, loading } = useRequest(
    () => portalService.queryMenus({ appCode: appCode! }),
    { refreshDeps: [appCode], cacheKey: `portal-menu-${appCode}` },
  );

  const menuList: PortalMenu[] = data?.data?.list || [];
  const routes = buildMenuTree(menuList);

  // 数据加载完成后默认选中第一个叶子菜单
  React.useEffect(() => {
    if (menuList.length && !selectedMenu) {
      const first = getFirstLeafName(menuList);
      if (first) setSelectedMenu(first);
    }
  }, [menuList]);

  return (
    <Spin spinning={loading} style={{ height: '100vh' }}>
      <ProLayout
        logo={LOGO}
        title={TITLE}
        route={{ path: '/', routes }}
        location={location}
        className={`${prefix}-portal-app-menu`}
        layout="side"
        siderWidth={200}
        token={{
          sider: {
            colorMenuBackground: '#2c2c2c',
            colorTextMenu: 'rgba(255,255,255,0.75)',
            colorTextMenuSelected: '#ffffff',
            colorTextMenuActive: '#ffffff',
            colorBgMenuItemSelected: 'rgba(255,255,255,0.15)',
            colorBgMenuItemHover: 'rgba(255,255,255,0.1)',
            colorTextMenuTitle: '#ffffff',
            colorMenuItemDivider: 'rgba(255,255,255,0.06)',
          },
        }}
        menuItemRender={(item, dom) => (
          <div onClick={() => setSelectedMenu(item.name as string)}>{dom}</div>
        )}
        actionsRender={() => [
          <span
            key="back"
            className={`${prefix}-portal-app-menu-back`}
            onClick={() => navigate('/home')}
          >
            <ArrowLeftOutlined />
            返回
          </span>,
        ]}
        avatarProps={{
          title: user?.username || '用户',
          size: 'small',
        }}
      >
        <div className={`${prefix}-portal-app-menu-content`}>
          {selectedMenu ? (
            <div className={`${prefix}-portal-app-menu-page`}>
              <div className={`${prefix}-portal-app-menu-page-header`}>
                <Breadcrumb items={[{ title: appCode }, { title: selectedMenu }]} />
                <h2 className={`${prefix}-portal-app-menu-page-title`}>{selectedMenu}</h2>
              </div>
              <div className={`${prefix}-portal-app-menu-placeholder`}>
                <Tag color="default">功能开发中</Tag>
              </div>
            </div>
          ) : (
            <div className={`${prefix}-portal-app-menu-welcome`}>
              {menuList.length === 0 && !loading
                ? <Empty description="该应用暂未配置菜单" />
                : <span>请从左侧选择菜单</span>
              }
            </div>
          )}
        </div>
      </ProLayout>
    </Spin>
  );
};

export default AppMenu;
