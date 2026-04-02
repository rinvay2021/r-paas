import React from 'react';
import { Spin, ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';

import RenderRouter from './routes';
import AuthProvider from './contexts/AuthContext';

function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <BrowserRouter>
          <React.Suspense
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
          </React.Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
