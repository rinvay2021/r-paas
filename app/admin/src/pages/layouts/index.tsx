import React from 'react';
import { Dropdown, Spin } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { ProLayout } from '@ant-design/pro-components';
import { useQueryParams, StringParam } from 'use-query-params';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { prefix, LAYOUT_SETTING, TITLE, LOGO } from '@/constant';
import { useMenus } from './menus';
import AiAssistant from './AiAssistant';
import './index.less';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [query] = useQueryParams({
    configurableType: StringParam,
    metaObjectCode: StringParam,
  });

  const { logout } = useAuth();
  const { route, loading } = useMenus();

  // 处理菜单点击
  const handleMenuClick = (item: any) => {
    if (item.path) {
      // 判断是否是同一路由
      const isSameRoute = location.pathname === item.path;

      // 同一路由需要保持参数
      if (isSameRoute) {
        const searchParams = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
          if (value) {
            searchParams.append(key, value);
          }
        });
        navigate(`${item.path}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
      } else {
        navigate(item.path);
      }
    }
  };

  return (
    <Spin spinning={loading} style={{ height: '100vh' }}>
      <ProLayout
        {...LAYOUT_SETTING}
        logo={LOGO}
        title={TITLE}
        route={route}
        location={location}
        className={`${prefix}-layout`}
        token={{
          header: {
            colorBgHeader: '#2c2c2c',
            colorHeaderTitle: '#ffffff',
            colorTextMenu: 'rgba(255,255,255,0.75)',
            colorTextMenuSelected: '#ffffff',
            colorTextMenuActive: '#ffffff',
            colorBgMenuItemSelected: 'rgba(255,255,255,0.15)',
            colorBgMenuItemHover: 'rgba(255,255,255,0.1)',
          },
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
        menuItemRender={(item, dom) => {
          return <div onClick={() => handleMenuClick(item)}>{dom}</div>;
        }}
        // TODO: 对接用户真实数据
        avatarProps={{
          title: '贝贝',
          src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
          size: 'small',
          render: (props, dom) => {
            return (
              <Dropdown
                menu={{
                  items: [
                    {
                      onClick: logout,
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: '退出登录',
                    },
                  ],
                }}
              >
                {dom}
              </Dropdown>
            );
          },
        }}
      >
        <Outlet />
      </ProLayout>
      <AiAssistant />
    </Spin>
  );
};

export default Layout;
