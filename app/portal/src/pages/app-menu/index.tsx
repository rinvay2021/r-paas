import React from 'react';
import { Empty, Spin, Drawer } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ProLayout } from '@ant-design/pro-components';
import WujieReact from 'wujie-react';
import { bus } from 'wujie';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { useAuth } from '@/contexts/AuthContext';
import { portalService } from '@/api/portal';
import { prefix, LOGO, TITLE } from '@/constant';
import type { PortalMenu } from '@/api/portal/interface';

import './index.less';

const RENDERER_ORIGIN = 'http://localhost:3005';

interface UrlParams {
  menuCode: string;
  url?: string;
}

// base64url 编码：只含 A-Za-z0-9-_，不含 & = + ? 等特殊字符，彻底安全
function setUrlParams(params: UrlParams): string {
  const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(params))));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function getUrlParams(raw: string): UrlParams | null {
  try {
    const base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4);
    return JSON.parse(decodeURIComponent(escape(atob(padded))));
  } catch {
    return null;
  }
}

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

function getFirstLeaf(menus: PortalMenu[]): PortalMenu | null {
  const roots = menus.filter(m => !m.parentId).sort((a, b) => a.orderNum - b.orderNum);
  if (!roots.length) return null;
  const firstRoot = roots[0];
  const children = menus
    .filter(m => String(m.parentId) === String(firstRoot._id))
    .sort((a, b) => a.orderNum - b.orderNum);
  return children.length ? children[0] : firstRoot;
}

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
  const [searchParams, setSearchParams] = useSearchParams();

  // urlParams 是唯一数据源，用原生 useSearchParams 完全自己控制编解码
  const parsed = React.useMemo(() => {
    const raw = searchParams.get('urlParams');
    console.log('[urlParams raw]', raw);
    if (!raw) return null;
    const result = getUrlParams(raw);
    console.log('[urlParams parsed]', result);
    return result;
  }, [searchParams]);

  console.log(searchParams, parsed, 'parsed ===')

  const menuCodeFromUrl = parsed?.menuCode || '';
  const mainRendererUrl = parsed?.url || null;

  const { user } = useAuth();

  const [drawerRendererUrl, setDrawerRendererUrl] = React.useState<string | null>(null);
  const [drawerTitle, setDrawerTitle] = React.useState<string | undefined>(undefined);
  const [formRendererUrl, setFormRendererUrl] = React.useState<string | null>(null);

  const notifyRefreshRef = React.useRef<(() => void) | null>(null);

  const { data, loading } = useRequest(
    () => portalService.queryMenus({ appCode: appCode! }),
    { refreshDeps: [appCode], cacheKey: `portal-menu-${appCode}` },
  );

  const menuList: PortalMenu[] = data?.data?.list || [];
  const routes = buildMenuTree(menuList);

  const selectedMenu = React.useMemo(() => {
    if (!menuList.length) return null;
    if (menuCodeFromUrl) {
      const found = menuList.find(m => m.menuCode === menuCodeFromUrl);
      if (found) return found;
    }
    return getFirstLeaf(menuList);
  }, [menuList, menuCodeFromUrl]);

  // 初始化：菜单加载后写入 urlParams
  React.useEffect(() => {
    if (!menuList.length) return;
    const target = menuCodeFromUrl
      ? (menuList.find(m => m.menuCode === menuCodeFromUrl) ?? getFirstLeaf(menuList))
      : getFirstLeaf(menuList);
    if (!target) return;
    if (menuCodeFromUrl && parsed?.url) return;
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('urlParams', setUrlParams({ menuCode: target.menuCode, url: buildRendererUrl(target) ?? undefined }));
      return next;
    }, { replace: true });
  }, [menuList]);

  // 监听 renderer 通过 wujie bus 发来的事件
  React.useEffect(() => {
    const onOverlayNavigate = (url: string) => {
      setDrawerRendererUrl(null);
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('urlParams', setUrlParams({ menuCode: menuCodeFromUrl, url }));
        return next;
      }, { replace: false });
    };

    const onPushDrawer = (item: { url: string; title?: string }) => {
      setDrawerTitle(item.title);
      setDrawerRendererUrl(item.url);
    };

    const onOpenNewPage = (url: string) => {
      const portalUrl = `${window.location.origin}/app/${appCode}?urlParams=${setUrlParams({ menuCode: menuCodeFromUrl, url })}`;
      window.open(portalUrl, '_blank');
    };

    let currentActionId: string | undefined;

    const onOpenFormModal = (params: {
      appCode: string; metaObjectCode: string; formCode: string; recordId?: string; actionId?: string;
    }) => {
      currentActionId = params.actionId;
      const url = `${RENDERER_ORIGIN}/?appCode=${params.appCode}&metaObjectCode=${params.metaObjectCode}&formCode=${params.formCode}${params.recordId ? `&recordId=${params.recordId}` : ''}`;
      setFormRendererUrl(url);
    };

    const onCloseFormModal = (submitted?: boolean) => {
      setFormRendererUrl(null);
      if (submitted) bus.$emit('portal:formClosed', { actionId: currentActionId });
      currentActionId = undefined;
    };

    bus.$on('renderer:overlayNavigate', onOverlayNavigate);
    bus.$on('renderer:pushDrawer', onPushDrawer);
    bus.$on('renderer:openNewPage', onOpenNewPage);
    bus.$on('renderer:openFormModal', onOpenFormModal);
    bus.$on('renderer:closeFormModal', onCloseFormModal);

    return () => {
      bus.$off('renderer:overlayNavigate', onOverlayNavigate);
      bus.$off('renderer:pushDrawer', onPushDrawer);
      bus.$off('renderer:openNewPage', onOpenNewPage);
      bus.$off('renderer:openFormModal', onOpenFormModal);
      bus.$off('renderer:closeFormModal', onCloseFormModal);
    };
  }, [menuCodeFromUrl]);

  const handleMenuSelect = (menu: PortalMenu) => {
    setDrawerRendererUrl(null);
    setFormRendererUrl(null);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('urlParams', setUrlParams({ menuCode: menu.menuCode, url: buildRendererUrl(menu) ?? undefined }));
      return next;
    }, { replace: false });
  };

  const selectedPath = selectedMenu
    ? `/app/${selectedMenu.appCode}/menu/${selectedMenu.menuCode}`
    : undefined;

  const mainWujieName = menuCodeFromUrl ? `renderer-${menuCodeFromUrl}` : (selectedMenu ? `renderer-${selectedMenu.menuCode}` : '');
  const drawerWujieName = 'renderer-drawer';
  const formWujieName = 'renderer-form';

  return (
    <Spin spinning={loading} style={{ height: '100vh' }}>
      <ProLayout
        logo={LOGO}
        title={TITLE}
        route={{ path: '/', routes }}
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
          <div onClick={() => item.menuData && handleMenuSelect(item.menuData)}>{dom}</div>
        )}
        actionsRender={() => [
          <span key="back" className={`${prefix}-portal-app-menu-back`} onClick={() => navigate('/home')}>
            <ArrowLeftOutlined />返回
          </span>,
        ]}
        avatarProps={{ title: user?.username || '用户', size: 'small' }}
      >
        <div className={`${prefix}-portal-app-menu-content`}>
          {mainRendererUrl && mainWujieName ? (
            <div className={`${prefix}-portal-app-menu-page`}>
              <div className={`${prefix}-portal-app-menu-view`}>
                <WujieReact
                  key={mainWujieName}
                  name={mainWujieName}
                  url={mainRendererUrl}
                  width="100%"
                  height="100%"
                  props={{
                    onRegisterRefresh: (fn: () => void) => { notifyRefreshRef.current = fn; },
                  }}
                />
              </div>
            </div>
          ) : (
            !loading && menuList.length === 0
              ? <Empty description="该应用暂未配置菜单" />
              : null
          )}
        </div>
      </ProLayout>

      {/* Drawer 容器 */}
      <Drawer
        open={!!drawerRendererUrl}
        width="80%"
        title={drawerTitle}
        onClose={() => setDrawerRendererUrl(null)}
        zIndex={1000}
        styles={{ body: { padding: 0, height: '100%', overflow: 'hidden' } }}
        destroyOnClose
      >
        {drawerRendererUrl && (
          <WujieReact
            name={drawerWujieName}
            url={drawerRendererUrl}
            width="100%"
            height="100%"
          />
        )}
      </Drawer>

      {/* 表单弹窗容器 */}
      {formRendererUrl && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          <WujieReact
            name={formWujieName}
            url={formRendererUrl}
            width="100%"
            height="100%"
          />
        </div>
      )}
    </Spin>
  );
};

export default AppMenu;
