import React from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// @ts-expect-error: 暂时绕过检查 登录页面
const Login = React.lazy(() => import('@/pages/login'));
// @ts-expect-error: 暂时绕过检查 首页
const Home = React.lazy(() => import('@/pages/home'));
// @ts-expect-error: 暂时绕过检查 应用菜单
const AppMenu = React.lazy(() => import('@/pages/app-menu'));

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RenderRouter: React.FC = () => {
  const routes = useRoutes([
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/',
      element: <Navigate to="/home" replace />,
    },
    {
      path: '/home',
      element: (
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      ),
    },
    {
      path: '/app/:appCode',
      element: (
        <PrivateRoute>
          <AppMenu />
        </PrivateRoute>
      ),
    },
  ]);

  return routes;
};

export default RenderRouter;
