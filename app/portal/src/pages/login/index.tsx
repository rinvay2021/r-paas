import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProConfigProvider, ProFormText } from '@ant-design/pro-components';
import { useAuth } from '@/contexts/AuthContext';
import { prefix, TITLE, LOGO } from '@/constant';

import './index.less';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      await login({ username: values.username, password: values.password });
      navigate('/home');
    } catch (error) {
      // 处理错误
    }
  };

  return (
    <ProConfigProvider hashed={false}>
      <div className={`${prefix}-login-container`}>
        <div className={`${prefix}-login-card`}>
          <div className={`${prefix}-login-header`}>
            <img src={LOGO} alt="logo" className={`${prefix}-login-logo`} />
            <h1 className={`${prefix}-login-title`}>{TITLE}</h1>
            <p className={`${prefix}-login-subtitle`}>欢迎回来，请登录您的账号</p>
          </div>
          <LoginForm
            onFinish={onFinish}
            contentStyle={{ padding: 0, minWidth: 'unset', width: '100%' }}
            submitter={{
              searchConfig: { submitText: '登 录' },
              submitButtonProps: { size: 'large', block: true },
            }}
          >
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined />,
              }}
              placeholder="请输入用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined />,
              }}
              placeholder="请输入密码"
              rules={[{ required: true, message: '请输入密码' }]}
            />
          </LoginForm>
        </div>
      </div>
    </ProConfigProvider>
  );
};

export default Login;
