import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { Spin, ConfigProvider } from 'antd';
import RenderRouter from './routes';
import AuthProvider from './contexts/AuthContext';

function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <BrowserRouter>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Suspense
              fallback={
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                  }}
                >
                  <Spin size="large" />
                </div>
              }
            >
              <RenderRouter />
            </Suspense>
          </QueryParamProvider>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
