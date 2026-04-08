import React from 'react';
import { theme, Typography } from 'antd';
import type { ViewData, ListData, SearchFormData, ActionButton } from '@r-paas/meta';
import { ButtonLevel, ButtonEvent } from '@r-paas/meta';
import { portalBus } from '@/utils/portalBus';
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
    btn => btn.buttonLevel === ButtonLevel.View
  );

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

  // 搜索表单默认值初始化
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

  const handleViewButtonClick = (btn: ActionButton) => {
    if (btn.buttonEvent === ButtonEvent.Create && btn.buttonConfig?.formCode) {
      portalBus.openFormModal({ appCode, metaObjectCode, formCode: btn.buttonConfig.formCode });
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 标题 + View 级按钮 */}
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
            onSearch={values => setSearchParams(buildSearchParams(values))}
          />
        </div>
      )}

      {/* 列表：MetaList 内部自己处理所有按钮、刷新、scrollY */}
      {list && (
        <div
          style={{
            flex: 1,
            background: token.colorBgContainer,
            borderRadius: token.borderRadius,
            padding: '8px 12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <MetaList
            listData={list}
            searchParams={searchParams}
          />
        </div>
      )}
    </div>
  );
};

export default MetaView;
