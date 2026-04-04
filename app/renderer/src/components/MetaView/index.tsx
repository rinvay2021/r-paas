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

// 表格 thead 行高 + pagination 区域高度
const TABLE_HEADER_HEIGHT = 47;
const TABLE_PAGINATION_HEIGHT = 100;

const MetaView: React.FC<MetaViewProps> = ({ viewData, appCode, metaObjectCode }) => {
  const { token } = theme.useToken();
  const { view, list, searchForm } = viewData;

  // 挂在表格容器 div 上，用于计算顶部到屏幕底部的距离
  const tableWrapRef = React.useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = React.useState<number | undefined>(undefined);

  const viewButtons: ActionButton[] = (view?.buttons || []).filter(
    btn => btn.buttonLevel === 'View'
  );
  const listButtons: ActionButton[] = ((list?.listConfig?.buttons as ActionButton[]) || []).filter(
    btn => btn.buttonLevel === 'List'
  );
  const pageButtons = [...viewButtons, ...listButtons];

  // 计算：window.innerHeight - 表格容器顶部 - 表头高度 - 分页高度
  const calcScrollY = React.useCallback(() => {
    if (!tableWrapRef.current) return;
    const top = tableWrapRef.current.getBoundingClientRect().top;
    const available = window.innerHeight - top - TABLE_HEADER_HEIGHT - TABLE_PAGINATION_HEIGHT;
    setScrollY(available > 100 ? available : undefined);
  }, []);

  React.useEffect(() => {
    // 等 DOM 布局完成后再计算
    const timer = requestAnimationFrame(calcScrollY);
    window.addEventListener('resize', calcScrollY);
    const observer = new ResizeObserver(calcScrollY);
    if (tableWrapRef.current) observer.observe(tableWrapRef.current);
    return () => {
      cancelAnimationFrame(timer);
      window.removeEventListener('resize', calcScrollY);
      observer.disconnect();
    };
  }, [calcScrollY, list]);

  const buildSearchParams = React.useCallback(
    (values: Record<string, any>) => {
      const fields = searchForm?.searchFormFields || [];
      return fields
        .filter(
          f =>
            values[f.fieldName] !== undefined &&
            values[f.fieldName] !== '' &&
            values[f.fieldName] !== null
        )
        .map(f => ({ fieldCode: f.fieldName, condition: f.condition, value: values[f.fieldName] }));
    },
    [searchForm]
  );

  const [searchParams, setSearchParams] = React.useState<
    Array<{ fieldCode: string; condition: string; value: any }>
  >([]);
  const [listKey, setListKey] = React.useState(0);

  React.useEffect(() => {
    if (!searchForm) return;
    const defaultValues: Record<string, any> = {};
    (searchForm.searchFormFields || []).forEach(f => {
      if (
        f.defaultValueType === 'custom' &&
        f.defaultValue !== undefined &&
        f.defaultValue !== ''
      ) {
        defaultValues[f.fieldName] = f.defaultValue;
      }
    });
    setSearchParams(buildSearchParams(defaultValues));
  }, [searchForm]);

  React.useEffect(() => {
    (window as any).__notifyListRefresh = () => setListKey(k => k + 1);
    return () => {
      delete (window as any).__notifyListRefresh;
    };
  }, []);

  const handleButtonClick = (btn: ActionButton, record?: any) => {
    const openForm = (window as any).__openFormModal;
    if (!openForm || !btn.buttonConfig?.formCode) return;

    if (btn.buttonEvent === 'Create') {
      openForm({ appCode, metaObjectCode, formCode: btn.buttonConfig.formCode });
    } else if (btn.buttonEvent === 'Update' && record?._id) {
      openForm({ appCode, metaObjectCode, formCode: btn.buttonConfig.formCode, recordId: record._id });
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {searchForm && (
        <div style={{ flexShrink: 0 }}>
          <MetaSearchForm
            searchFormData={searchForm}
            onSearch={values => {
              setSearchParams(buildSearchParams(values));
              setListKey(k => k + 1);
            }}
          />
        </div>
      )}

      {list && (
        <>
          {pageButtons.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, padding: '0 12px' }}>
              <MetaActionButtons
                buttons={pageButtons}
                level="page"
                onButtonClick={handleButtonClick}
              />
            </div>
          )}
          <div
            ref={tableWrapRef}
            style={{
              flex: 1,
              background: token.colorBgContainer,
              borderRadius: token.borderRadius,
              padding: '8px 12px',
              overflow: 'hidden',
            }}
          >
            <MetaList
              listData={list}
              appCode={appCode}
              metaObjectCode={metaObjectCode}
              refreshKey={listKey}
              searchParams={searchParams}
              scrollY={scrollY}
              onButtonClick={handleButtonClick}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default MetaView;
