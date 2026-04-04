import React from 'react';
import { ConfigProvider, Spin, Result } from 'antd';

const FormPage = React.lazy(() => import('@/pages/FormPage'));
const DetailPage = React.lazy(() => import('@/pages/DetailPage'));
const ViewPage = React.lazy(() => import('@/pages/ViewPage'));
const ListPage = React.lazy(() => import('@/pages/ListPage'));
const SearchFormPage = React.lazy(() => import('@/pages/SearchFormPage'));

// 错误边界
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <Result
            status="error"
            title="渲染失败"
            subTitle={this.state.error?.message || '元数据配置有误，请检查后重试'}
          />
        </div>
      );
    }
    return this.props.children;
  }
}

function getPageType() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('formCode')) return 'form';
  if (params.get('detailPageCode')) return 'detail';
  if (params.get('viewCode')) return 'view';
  if (params.get('listCode')) return 'list';
  if (params.get('searchFormCode')) return 'searchForm';
  return null;
}

function App() {
  // 在组件内计算，确保 wujie 环境下 location 已正确初始化
  const pageType = React.useMemo(() => getPageType(), []);

  // 顶层表单弹窗状态（供 ViewPage 通过全局函数触发）
  const [modalFormParams, setModalFormParams] = React.useState<{
    appCode: string;
    metaObjectCode: string;
    formCode: string;
    recordId?: string;
  } | null>(null);

  // 挂载全局函数，ViewPage 调用此函数打开表单
  React.useEffect(() => {
    (window as any).__openFormModal = (params: { appCode: string; metaObjectCode: string; formCode: string }) => {
      setModalFormParams(params);
    };
    (window as any).__closeFormModal = () => {
      setModalFormParams(null);
    };
    return () => {
      delete (window as any).__openFormModal;
      delete (window as any).__closeFormModal;
    };
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 6,
          colorPrimary: '#1a1a1a',
          colorLink: '#1a1a1a',
          colorLinkHover: '#333',
          colorLinkActive: '#000',
        },
        components: {
          Button: {
            colorPrimary: '#1a1a1a',
            colorPrimaryHover: '#333',
            colorPrimaryActive: '#000',
          },
          Table: {
            colorPrimary: '#1a1a1a',
          },
        },
      }}
    >
      <ErrorBoundary>
        <React.Suspense
          fallback={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
              <Spin size="large" tip="加载中..." />
            </div>
          }
        >
          {pageType === 'form' && <FormPage />}
          {pageType === 'detail' && <DetailPage />}
          {pageType === 'view' && <ViewPage />}
          {pageType === 'list' && <ListPage />}
          {pageType === 'searchForm' && <SearchFormPage />}
          {!pageType && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
              <Result
                status="warning"
                title="缺少必要参数"
                subTitle="URL 需要包含 formCode、detailPageCode 或 viewCode 参数"
              />
            </div>
          )}
        </React.Suspense>

        {modalFormParams && pageType === 'view' && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
            <React.Suspense fallback={null}>
              <FormPage
                overrideParams={modalFormParams}
                onClose={(submitted) => {
                  setModalFormParams(null);
                  if (submitted) {
                    const notify = (window as any).__notifyListRefresh;
                    if (notify) notify();
                  }
                }}
              />
            </React.Suspense>
          </div>
        )}
      </ErrorBoundary>
    </ConfigProvider>
  );
}

export default App;
