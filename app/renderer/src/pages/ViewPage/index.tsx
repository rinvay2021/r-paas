import React from 'react';
import { Skeleton, Result, theme } from 'antd';
import { useRequest } from 'ahooks';
import { rendererApi } from '@/api/renderer';
import MetaSearchForm from '@/components/MetaSearchForm';
import MetaList from '@/components/MetaList';
import MetaActionButtons from '@/components/MetaActionButtons';
import type { ActionButton } from '@/api/renderer/interface';

interface ViewPageProps {
  appCode?: string;
  metaObjectCode?: string;
  viewCode?: string;
  embedded?: boolean;
}

const ViewPage: React.FC<ViewPageProps> = (props) => {
  const urlParams = new URLSearchParams(window.location.search);
  const appCode = props.appCode || urlParams.get('appCode') || '';
  const metaObjectCode = props.metaObjectCode || urlParams.get('metaObjectCode') || '';
  const viewCode = props.viewCode || urlParams.get('viewCode') || '';

  const { data, loading, error } = useRequest(
    () => rendererApi.getView({ appCode, metaObjectCode, viewCode }),
    { ready: !!(appCode && metaObjectCode && viewCode) },
  );

  const { token } = theme.useToken();

  const viewData = data?.data;
  const view = viewData?.view;
  const list = viewData?.list;
  const searchForm = viewData?.searchForm;

  const viewButtons: ActionButton[] = (view?.buttons || []).filter(
    (btn) => btn.buttonLevel === 'View',
  );
  const listButtons: ActionButton[] = (
    (list?.listConfig?.buttons as ActionButton[]) || []
  ).filter((btn) => btn.buttonLevel === 'List');

  // 用搜索表单的自定义默认值初始化 searchParams
  const buildSearchParams = React.useCallback((values: Record<string, any>) => {
    const fields = searchForm?.searchFormFields || [];
    return fields
      .filter(f => values[f.fieldName] !== undefined && values[f.fieldName] !== '' && values[f.fieldName] !== null)
      .map(f => ({ fieldCode: f.fieldName, condition: f.condition, value: values[f.fieldName] }));
  }, [searchForm]);

  const [searchParams, setSearchParams] = React.useState<Array<{ fieldCode: string; condition: string; value: any }>>([]);
  const [listKey, setListKey] = React.useState(0);

  // 搜索表单加载完成后，用默认值初始化一次查询
  React.useEffect(() => {
    if (!searchForm) return;
    const defaultValues: Record<string, any> = {};
    (searchForm.searchFormFields || []).forEach(f => {
      if (f.defaultValueType === 'custom' && f.defaultValue !== undefined && f.defaultValue !== '') {
        defaultValues[f.fieldName] = f.defaultValue;
      }
    });
    setSearchParams(buildSearchParams(defaultValues));
  }, [searchForm]);

  // 挂载全局刷新函数供 App.tsx 的 onClose 回调调用
  React.useEffect(() => {
    (window as any).__notifyListRefresh = () => setListKey((k) => k + 1);
    return () => { delete (window as any).__notifyListRefresh; };
  }, []);

  const handleButtonClick = (btn: ActionButton) => {
    if (btn.buttonEvent === 'Create' && btn.buttonConfig?.formCode) {
      // 调用 App.tsx 挂载的全局函数打开表单弹窗（同层渲染，避免 iframe 嵌套）
      const openForm = (window as any).__openFormModal;
      if (openForm) {
        openForm({ appCode, metaObjectCode, formCode: btn.buttonConfig.formCode });
      }
    }
  };

  if (error) {
    return <Result status="error" title="加载失败" subTitle={error.message} />;
  }

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  const pageButtons = [...viewButtons, ...listButtons];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 搜索表单 */}
      {searchForm && (
        <div style={{ flexShrink: 0 }}>
          <MetaSearchForm
            searchFormData={searchForm}
            onSearch={(values) => {
              setSearchParams(buildSearchParams(values));
              setListKey(k => k + 1);
            }}
          />
        </div>
      )}

      {/* 列表区域 */}
      {list && (
        <div
          style={{
            flex: 1,
            background: token.colorBgContainer,
            borderRadius: token.borderRadius,
            padding: '8px 12px',
            overflow: 'auto',
          }}
        >
          {pageButtons.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <MetaActionButtons
                buttons={pageButtons}
                level="page"
                onButtonClick={handleButtonClick}
              />
            </div>
          )}
          <MetaList
            listData={list}
            appCode={appCode}
            metaObjectCode={metaObjectCode}
            refreshKey={listKey}
            searchParams={searchParams}
            onButtonClick={(btn, record) => console.log('row button:', btn, record)}
          />
        </div>
      )}
    </div>
  );
};

export default ViewPage;
