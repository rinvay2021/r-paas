import React from 'react';
import { Empty, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ProLayout } from '@ant-design/pro-components';
import WujieReact from 'wujie-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { useAuth } from '@/contexts/AuthContext';
import { portalService } from '@/api/portal';
import { prefix, LOGO, TITLE } from '@/constant';
import type { PortalMenu } from '@/api/portal/interface';

import './index.less';

const RENDERER_ORIGIN = 'http://localhost:3005';

function buildMenuTree(menus: PortalMenu[]) {
  const rootMenus = menus.filter(m => !m.parentId).sort((a, b) => a.orderNum - b.orderNum);
  const childMenus = menus.filter(m => !!m.parentId);

  return rootMenus.map(parent => {
    const children = childMenus
      .filter(c => String(c.parentId) === String(parent._id))
      .sort((a, b) => a.orderNum - b.orderNum);

    const item: any = {
      path: `/app/${parent.appCode}/menu/${parent.menuCode}`,
      name: parent.menuName,
      menuData: parent,
    };
    if (children.length > 0) {
      item.routes = children.map(child => ({
        path: `/app/${child.appCode}/menu/${child.menuCode}`,
        name: child.menuName,
        menuData: child,
      }));
    }
    return item;
  });
}

/** 取第一个叶子菜单 */
function getFirstLeaf(menus: PortalMenu[]): PortalMenu | null {
  const roots = menus.filter(m => !m.parentId).sort((a, b) => a.orderNum - b.orderNum);
  if (!roots.length) return null;
  const firstRoot = roots[0];
  const children = menus
    .filter(m => String(m.parentId) === String(firstRoot._id))
    .sort((a, b) => a.orderNum - b.orderNum);
  return children.length ? children[0] : firstRoot;
}

/** 根据菜单拼接 renderer URL */
function buildRendererUrl(menu: PortalMenu): string | null {
  if (!menu.viewCode || !menu.metaObjectCode) return null;
  const params = new URLSearchParams({
    appCode: menu.appCode,
    metaObjectCode: menu.metaObjectCode,
    viewCode: menu.viewCode,
  });
  return `${RENDERER_ORIGIN}/?${params.toString()}`;
}

const AppMenu: React.FC = () => {
  const { appCode } = useParams<{ appCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedMenu, setSelectedMenu] = React.useState<PortalMenu | null>(null);

  const { data, loading } = useRequest(
    () => portalService.queryMenus({ appCode: appCode! }),
    { refreshDeps: [appCode], cacheKey: `portal-menu-${appCode}` },
  );

  const menuList: PortalMenu[] = data?.data?.list || [];
  const routes = buildMenuTree(menuList);

  // 默认选中第一个叶子菜单
  React.useEffect(() => {
    if (menuList.length && !selectedMenu) {
      const first = getFirstLeaf(menuList);
      if (first) setSelectedMenu(first);
    }
  }, [menuList]);

  // 当前选中菜单的 path，用于 ProLayout 高亮 + 展开
  const selectedPath = selectedMenu
    ? `/app/${selectedMenu.appCode}/menu/${selectedMenu.menuCode}`
    : undefined;

  const rendererUrl = selectedMenu ? buildRendererUrl(selectedMenu) : null;

  return (
    <Spin spinning={loading} style={{ height: '100vh' }}>
      <ProLayout
        logo={LOGO}
        title={TITLE}
        route={{ path: '/', routes }}
        // 把选中 path 传给 location，ProLayout 自动高亮并展开父菜单
        location={{ pathname: selectedPath }}
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
        menuItemRender={(item: any, dom) => (
          <div onClick={() => item.menuData && setSelectedMenu(item.menuData)}>{dom}</div>
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
              <div className={`${prefix}-portal-app-menu-view`}>
                {rendererUrl ? (
                  <WujieReact
                    key={rendererUrl}
                    name={`renderer-${selectedMenu.menuCode}`}
                    url={rendererUrl}
                    width="100%"
                    height="100%"
                  />
                ) : (
                  <Empty description="该菜单未绑定视图，请在管理后台配置 viewCode 和 metaObjectCode" />
                )}
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
