import React from 'react';
import { theme, Typography } from 'antd';
import type { ViewData, ListData, SearchFormData, ActionButton } from '@r-paas/meta';
import { ButtonLevel } from '@r-paas/meta';
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
  overrideButtons?: ActionButton[];
  fixedHeight?: number;
}

const MetaView: React.FC<MetaViewProps> = ({ viewData, overrideButtons, fixedHeight }) => {
  const { token } = theme.useToken();
  const { view, list, searchForm } = viewData;

  // appCode/metaObjectCode 从 list 元数据取
  const appCode = list?.appCode || '';
  const metaObjectCode = list?.metaObjectCode || '';

  const effectiveViewButtons: ActionButton[] = (overrideButtons ?? (view?.buttons || []))
    .filter(btn => btn.buttonLevel === ButtonLevel.View);

  // 列表级 override：有配置则覆盖，没有则 undefined（MetaList 用自身配置）
  const listOverride = overrideButtons
    ? overrideButtons.filter(btn => btn.buttonLevel === ButtonLevel.List || btn.buttonLevel === ButtonLevel.ListRow)
    : undefined;
  const effectiveListOverride = listOverride?.length ? listOverride : undefined;

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

  // 列表刷新函数，供 view 级按钮的 afterAction 使用
  const listRefreshRef = React.useRef<(() => void) | null>(null);
  const afterAction = React.useCallback(() => {
    listRefreshRef.current?.();
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {(view?.viewName || effectiveViewButtons.length > 0) && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', flexShrink: 0,
        }}>
          <Typography.Text style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>
            {view?.viewName}
          </Typography.Text>
          {effectiveViewButtons.length > 0 && (
            <MetaActionButtons
              buttons={effectiveViewButtons}
              variant="block"
              mode="view"
              afterAction={afterAction}
            />
          )}
        </div>
      )}

      {searchForm && (
        <div style={{ flexShrink: 0 }}>
          <MetaSearchForm
            searchFormData={searchForm}
            onSearch={values => setSearchParams(buildSearchParams(values))}
          />
        </div>
      )}

      {list && (
        <div style={{
          flex: 1,
          background: token.colorBgContainer,
          borderRadius: token.borderRadius,
          padding: '8px 12px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <MetaListWithRef
            listData={list}
            searchParams={searchParams}
            overrideButtons={effectiveListOverride}
            fixedHeight={fixedHeight}
            onRefreshReady={(fn) => { listRefreshRef.current = fn; }}
          />
        </div>
      )}
    </div>
  );
};

// MetaList 包装，暴露 refresh 给父组件
const MetaListWithRef: React.FC<{
  listData: ListData;
  searchParams?: Array<{ fieldCode: string; condition: string; value: any }>;
  overrideButtons?: ActionButton[];
  fixedHeight?: number;
  onRefreshReady: (fn: () => void) => void;
}> = ({ onRefreshReady, ...props }) => {
  return <MetaList {...props} onRefreshReady={onRefreshReady} />;
};

export default MetaView;
