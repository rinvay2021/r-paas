import React from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// 登录页面
const Login = React.lazy(() => import('@/pages/login'));
// 布局页面
const Layout = React.lazy(() => import('@/pages/layouts'));
// 控制台
const Dashboard = React.lazy(() => import('@/pages/dashboard'));
// 对象配置
const Meta = React.lazy(() => import('@/pages/meta'));
// 菜单配置
const Menu = React.lazy(() => import('@/pages/menu'));
// 数据源配置
const Datasource = React.lazy(() => import('@/pages/datasource'));

// 添加类型定义
interface PrivateRouteProps {
  children: React.ReactNode;
}

// 使用类型注解
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // 如果未认证，重定向到登录页面
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// 添加返回类型
const RenderRouter: React.FC = () => {
  const routes = useRoutes([
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/',
      element: (
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      ),
      children: [
        {
          path: '',
          element: <Navigate to="/dashboard" replace />,
        },
        {
          path: 'dashboard',
          element: <Dashboard />,
        },
        {
          path: 'app/:appCode',
          children: [
            {
              path: 'meta',
              element: <Meta />,
            },
            {
              path: 'menu',
              element: <Menu />,
            },
            {
              path: 'datasource',
              element: <Datasource />,
            },
          ],
        },
      ],
    },
  ]);

  return routes;
};

export default RenderRouter;
