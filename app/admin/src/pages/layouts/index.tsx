import React from 'react';
import { Dropdown, Spin } from 'antd';
import { ProLayout } from '@ant-design/pro-components';
import type { ProSettings } from '@ant-design/pro-components';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';
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

  const { logout } = useAuth();
  const { route, loading } = useMenus();

  // 处理菜单点击
  const handleMenuClick = (item: any) => {
    if (item.path) {
      navigate(item.path);
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
