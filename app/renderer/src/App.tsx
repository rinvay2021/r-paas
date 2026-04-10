import React from 'react';
import { ConfigProvider, Spin, Result } from 'antd';

const FormPage = React.lazy(() => import('@/pages/FormPage'));
const DetailPage = React.lazy(() => import('@/pages/DetailPage'));
const ViewPage = React.lazy(() => import('@/pages/ViewPage'));
const ListPage = React.lazy(() => import('@/pages/ListPage'));
const SearchFormPage = React.lazy(() => import('@/pages/SearchFormPage'));
const TaskListPage = React.lazy(() => import('@/pages/TaskListPage'));

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
          <Result status="error" title="渲染失败" subTitle={this.state.error?.message} />
        </div>
      );
    }
    return this.props.children;
  }
}

function getPageTypeFromSearch(search: string) {
  const params = new URLSearchParams(search);
  if (params.get('taskList') === '1') return 'taskList';
  if (params.get('formCode')) return 'form';
  if (params.get('detailPageCode')) return 'detail';
  if (params.get('viewCode')) return 'view';
  if (params.get('listCode')) return 'list';
  if (params.get('searchFormCode')) return 'searchForm';
  return null;
}

function App() {
  // null = 尚未初始化（避免闪烁错误提示），string = 已读取
  const [search, setSearch] = React.useState<string | null>(null);

  React.useEffect(() => {
    // 挂载后读取真实 search（wujie proxyLocation 已就绪）
    setSearch(window.location.search);
  }, []);

  const pageType = search === null ? null : getPageTypeFromSearch(search);

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
          Button: { colorPrimary: '#1a1a1a', colorPrimaryHover: '#333', colorPrimaryActive: '#000' },
          Table: { colorPrimary: '#1a1a1a' },
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
          {search === null && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
              <Spin size="large" />
            </div>
          )}
          {pageType === 'taskList' && <TaskListPage />}
          {pageType === 'form' && <FormPage />}
          {pageType === 'detail' && <DetailPage />}
          {pageType === 'view' && <ViewPage />}
          {pageType === 'list' && <ListPage />}
          {pageType === 'searchForm' && <SearchFormPage />}
          {search !== null && !pageType && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
              <Result status="warning" title="缺少必要参数" subTitle="URL 需要包含 viewCode、detailPageCode、formCode 等参数" />
            </div>
          )}
        </React.Suspense>
      </ErrorBoundary>
    </ConfigProvider>
  );
}

export default App;
