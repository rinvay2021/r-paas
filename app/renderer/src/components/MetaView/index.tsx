import React from 'react';
import { theme } from 'antd';
import type { ViewData, ListData, SearchFormData, ActionButton } from '@r-paas/meta';
import MetaSearchForm from '@/components/MetaSearchForm';
import MetaList from '@/components/MetaList';
import MetaActionButtons from '@/components/MetaActionButtons';

export interface MetaViewData {
  view: ViewData;
  list: ListData | null;
  searchForm: SearchFormData | null;
}

interface MetaViewProps {
  viewData: MetaViewData;
  appCode: string;
  metaObjectCode: string;
}

const MetaView: React.FC<MetaViewProps> = ({ viewData, appCode, metaObjectCode }) => {
  const { token } = theme.useToken();
  const { view, list, searchForm } = viewData;

  const viewButtons: ActionButton[] = (view?.buttons || []).filter(
    btn => btn.buttonLevel === 'View',
  );
  const listButtons: ActionButton[] = (
    (list?.listConfig?.buttons as ActionButton[]) || []
  ).filter(btn => btn.buttonLevel === 'List');
  const pageButtons = [...viewButtons, ...listButtons];

  const buildSearchParams = React.useCallback((values: Record<string, any>) => {
    const fields = searchForm?.searchFormFields || [];
    return fields
      .filter(f => values[f.fieldName] !== undefined && values[f.fieldName] !== '' && values[f.fieldName] !== null)
      .map(f => ({ fieldCode: f.fieldName, condition: f.condition, value: values[f.fieldName] }));
  }, [searchForm]);

  const [searchParams, setSearchParams] = React.useState<Array<{ fieldCode: string; condition: string; value: any }>>([]);
  const [listKey, setListKey] = React.useState(0);

  // 搜索表单加载后用默认值初始化查询
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

  // 挂载全局刷新函数
  React.useEffect(() => {
    (window as any).__notifyListRefresh = () => setListKey(k => k + 1);
    return () => { delete (window as any).__notifyListRefresh; };
  }, []);

  const handleButtonClick = (btn: ActionButton) => {
    if (btn.buttonEvent === 'Create' && btn.buttonConfig?.formCode) {
      const openForm = (window as any).__openFormModal;
      if (openForm) {
        openForm({ appCode, metaObjectCode, formCode: btn.buttonConfig.formCode });
      }
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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

export default MetaView;
