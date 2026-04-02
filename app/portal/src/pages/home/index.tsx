import React from 'react';
import { Empty, Spin, Avatar, Dropdown } from 'antd';
import { LogoutOutlined, UserOutlined, AppstoreOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { useAuth } from '@/contexts/AuthContext';
import { portalService } from '@/api/portal';
import { prefix, LOGO, TITLE } from '@/constant';
import type { PortalApp } from '@/api/portal/interface';

import './index.less';

const AppCard: React.FC<{ app: PortalApp; onClick: () => void }> = ({ app, onClick }) => (
  <div className={`${prefix}-portal-home-card`} onClick={onClick}>
    <div className={`${prefix}-portal-home-card-icon`}>
      <AppstoreOutlined />
    </div>
    <div className={`${prefix}-portal-home-card-info`}>
      <div className={`${prefix}-portal-home-card-name`}>{app.appName}</div>
      <div className={`${prefix}-portal-home-card-desc`}>{app.appDesc || app.appCode}</div>
    </div>
    <RightOutlined className={`${prefix}-portal-home-card-arrow`} />
  </div>
);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const { data, loading } = useRequest(() => portalService.queryApps(), {
    cacheKey: 'portal-app-list',
  });

  const appList: PortalApp[] = data?.data?.list || [];

  return (
    <div className={`${prefix}-portal-home`}>
      {/* 左侧导航 */}
      <aside className={`${prefix}-portal-home-aside`}>
        <div className={`${prefix}-portal-home-aside-logo`}>
          <img src={LOGO} alt="logo" />
        </div>
        <nav className={`${prefix}-portal-home-aside-nav`}>
          <div className={`${prefix}-portal-home-aside-nav-item active`}>
            <AppstoreOutlined />
            <span>应用</span>
          </div>
        </nav>
        <div className={`${prefix}-portal-home-aside-bottom`}>
          <Dropdown
            menu={{ items: [{ key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: logout }] }}
            placement="topLeft"
          >
            <div className={`${prefix}-portal-home-aside-user`}>
              <Avatar icon={<UserOutlined />} size={28} />
              <span>{user?.username || '用户'}</span>
            </div>
          </Dropdown>
        </div>
      </aside>

      {/* 右侧内容 */}
      <main className={`${prefix}-portal-home-main`}>
        <div className={`${prefix}-portal-home-topbar`}>
          <span className={`${prefix}-portal-home-topbar-title`}>全部应用</span>
          {!loading && <span className={`${prefix}-portal-home-topbar-count`}>{appList.length} 个</span>}
        </div>

        <Spin spinning={loading}>
          {appList.length === 0 && !loading ? (
            <Empty description="暂无应用" style={{ marginTop: 80 }} />
          ) : (
            <div className={`${prefix}-portal-home-grid`}>
              {appList.map(app => (
                <AppCard key={app.appCode} app={app} onClick={() => navigate(`/app/${app.appCode}`)} />
              ))}
            </div>
          )}
        </Spin>
      </main>
    </div>
  );
};

export default Home;
