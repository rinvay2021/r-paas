import React from 'react';
import { Provider } from 'jotai';
import { Spin, ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';

import RenderRouter from './routes';
import AuthProvider from './contexts/AuthContext';

function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#141414' } }}>
      <Provider>
        <AuthProvider>
          <BrowserRouter>
            <QueryParamProvider adapter={ReactRouter6Adapter}>
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
            </QueryParamProvider>
          </BrowserRouter>
        </AuthProvider>
      </Provider>
    </ConfigProvider>
  );
}

export default App;
