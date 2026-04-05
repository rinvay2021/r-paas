import React from 'react';
import { theme, Typography } from 'antd';
import type { ViewData, ListData, SearchFormData, ActionButton } from '@r-paas/meta';
import { ButtonLevel, ButtonEvent } from '@r-paas/meta';
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

  const tableWrapRef = React.useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = React.useState<number | undefined>(undefined);

  // View 级按钮（标题右侧）
  const viewButtons: ActionButton[] = (view?.buttons || []).filter(
    btn => btn.buttonLevel === ButtonLevel.View
  );

  const calcScrollY = React.useCallback(() => {
    if (!tableWrapRef.current) return;
    const top = tableWrapRef.current.getBoundingClientRect().top;
    const available = window.innerHeight - top - TABLE_HEADER_HEIGHT - TABLE_PAGINATION_HEIGHT;
    setScrollY(available > 100 ? available : undefined);
  }, []);

  React.useEffect(() => {
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
        .filter(f => values[f.fieldName] !== undefined && values[f.fieldName] !== '' && values[f.fieldName] !== null)
        .map(f => ({ fieldCode: f.fieldName, condition: f.condition, value: values[f.fieldName] }));
    },
    [searchForm]
  );

  const [searchParams, setSearchParams] = React.useState<Array<{ fieldCode: string; condition: string; value: any }>>([]);
  const [listKey, setListKey] = React.useState(0);

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

  React.useEffect(() => {
    (window as any).__notifyListRefresh = () => setListKey(k => k + 1);
    return () => { delete (window as any).__notifyListRefresh; };
  }, []);

  // View 级按钮事件（Create 等），提交后刷新列表
  const handleViewButtonClick = (btn: ActionButton) => {
    if (btn.buttonEvent === ButtonEvent.Create && btn.buttonConfig?.formCode) {
      const openForm = (window as any).__openFormModal;
      if (openForm) openForm({ appCode, metaObjectCode, formCode: btn.buttonConfig.formCode });
    }
  };

  // App.tsx 的 onClose(submitted=true) 会调 __notifyListRefresh，已在 useEffect 里监听

  // 行级按钮中 Update 事件由 MetaView 处理（需要打开表单弹窗）
  const handleRowButtonClick = (btn: ActionButton, record: any) => {
    if (btn.buttonEvent === ButtonEvent.Update && btn.buttonConfig?.formCode && record?._id) {
      const openForm = (window as any).__openFormModal;
      if (openForm) openForm({ appCode, metaObjectCode, formCode: btn.buttonConfig.formCode, recordId: record._id });
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 标题 + View 级按钮左右布局，与搜索表单/列表对齐 */}
      {(view?.viewName || viewButtons.length > 0) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          flexShrink: 0,
        }}>
          <Typography.Text style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>
            {view?.viewName}
          </Typography.Text>
          {viewButtons.length > 0 && (
            <MetaActionButtons
              buttons={viewButtons}
              level="page"
              onButtonClick={handleViewButtonClick}
            />
          )}
        </div>
      )}

      {/* 搜索表单 */}
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

      {/* 列表区域（含 List 级按钮、操作列、批量操作） */}
      {list && (
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
            onButtonClick={handleRowButtonClick}
          />
        </div>
      )}
    </div>
  );
};

export default MetaView;
