import React from 'react';
import { Dropdown, Spin } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { ProLayout } from '@ant-design/pro-components';
import type { ProSettings } from '@ant-design/pro-components';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useQueryParams, StringParam } from 'use-query-params';
import { useAuth } from '@/contexts/AuthContext';
import { useMenus } from './menus';
import './index.less';

const layoutSetting: ProSettings = {
  layout: 'mix',
};

const title = 'R-PaaS';

const logo =
  'https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*1NHAQYduQiQAAAAAAAAAAABkARQnAQ';

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
        logo={logo}
        title={title}
        route={route}
        {...layoutSetting}
        location={location}
        className="rpaas-layout"
        menuItemRender={(item, dom) => {
          return <div onClick={() => handleMenuClick(item)}>{dom}</div>;
        }}
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
    </Spin>
  );
};

export default Layout;
