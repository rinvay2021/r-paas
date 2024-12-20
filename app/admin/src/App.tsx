import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Spin, ConfigProvider } from 'antd';
import RenderRouter from './routes';
import AuthProvider from './contexts/AuthContext';

function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <BrowserRouter>
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
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
