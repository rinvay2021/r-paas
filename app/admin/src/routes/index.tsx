import React from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/layouts/MainLayout';

// 懒加载路由组件
const Login = React.lazy(() => import('@/pages/Login'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
// const NotFound = React.lazy(() => import('@/pages/NotFound'));

// 添加类型定义
interface PrivateRouteProps {
  children: React.ReactNode;
}

// 使用类型注解
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

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
          <MainLayout />
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
      ],
    },
    // {
    //   path: '*',
    //   element: <NotFound />,
    // },
  ]);

  return routes;
};

export default RenderRouter;
