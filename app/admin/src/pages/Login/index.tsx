import React from 'react';
import { theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import {
  LoginForm,
  ProConfigProvider,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { useAuth } from '@/contexts/AuthContext';

import './index.less';

const Login: React.FC = () => {
  const { token } = theme.useToken();

  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      await login({ username: values.username, password: values.password });
      navigate('/dashboard');
    } catch (error) {
      // 处理错误
    }
  };

  return (
    <ProConfigProvider hashed={false}>
      <div
        className="login-container"
        style={{
          backgroundColor: token.colorBgContainer,
        }}
      >
        <LoginForm onFinish={onFinish}>
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined className={'prefixIcon'} />,
            }}
            placeholder={'请输入用户名'}
            rules={[
              {
                required: true,
                message: '请输入用户名!',
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={'prefixIcon'} />,
              strengthText: '密码应包含数字、字母和特殊字符，至少8个字符。',
              statusRender: value => {
                const getStatus = () => {
                  if (value && value.length > 12) {
                    return 'ok';
                  }
                  if (value && value.length > 6) {
                    return 'pass';
                  }
                  return 'poor';
                };
                const status = getStatus();
                if (status === 'pass') {
                  return <div style={{ color: token.colorWarning }}>强度：中</div>;
                }
                if (status === 'ok') {
                  return <div style={{ color: token.colorSuccess }}>强度：强</div>;
                }
                return <div style={{ color: token.colorError }}>强度：弱</div>;
              },
            }}
            placeholder={'请输入密码'}
            rules={[
              {
                required: true,
                message: '请输入密码！',
              },
            ]}
          />
          <div
            style={{
              marginBlockEnd: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
            >
              忘记密码
            </a>
          </div>
        </LoginForm>
      </div>
    </ProConfigProvider>
  );
};

export default Login;
