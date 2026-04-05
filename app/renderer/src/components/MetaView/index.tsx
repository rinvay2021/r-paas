import React from 'react';
import { theme, message } from 'antd';
import type { ViewData, ListData, SearchFormData, ActionButton } from '@r-paas/meta';
import { dataApi } from '@/api/data';
import BatchUpdateModal from '@/components/BatchUpdateModal';
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
  const [selectedRows, setSelectedRows] = React.useState<any[]>([]);
  const [batchUpdateOpen, setBatchUpdateOpen] = React.useState(false);

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

  const handleButtonClick = async (btn: ActionButton, record?: any) => {
    if (btn.buttonEvent === 'Create' && btn.buttonConfig?.formCode) {
      const openForm = (window as any).__openFormModal;
      if (openForm) openForm({ appCode, metaObjectCode, formCode: btn.buttonConfig.formCode });

    } else if (btn.buttonEvent === 'Update' && btn.buttonConfig?.formCode && record?._id) {
      const openForm = (window as any).__openFormModal;
      if (openForm) openForm({ appCode, metaObjectCode, formCode: btn.buttonConfig.formCode, recordId: record._id });

    } else if (btn.buttonEvent === 'Delete' && record?._id) {
      try {
        await dataApi.delete({ appCode, metaObjectCode, id: record._id });
        message.success('删除成功');
        setListKey(k => k + 1);
      } catch (err: any) {
        message.error(err?.message || '删除失败');
      }

    } else if (btn.buttonEvent === 'BatchUpdate') {
      if (selectedRows.length === 0) {
        message.warning('请先勾选要编辑的记录');
        return;
      }
      setBatchUpdateOpen(true);

    } else if (btn.buttonEvent === 'BatchDelete') {
      if (selectedRows.length === 0) {
        message.warning('请先勾选要删除的记录');
        return;
      }
      // Popconfirm 已处理二次确认
      try {
        const ids = selectedRows.map(r => r._id).filter(Boolean);
        await dataApi.batchDelete({ appCode, metaObjectCode, ids });
        message.success(`已删除 ${ids.length} 条记录`);
        setSelectedRows([]);
        setListKey(k => k + 1);
      } catch (err: any) {
        message.error(err?.message || '批量删除失败');
      }
    }
  };

  return (
    <>
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
                onBeforeConfirm={(btn) => {
                  // BatchDelete 需要先选中才弹确认框
                  if (btn.buttonEvent === 'BatchDelete') return selectedRows.length > 0;
                  return true;
                }}
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
              onSelectionChange={setSelectedRows}
              onButtonClick={handleButtonClick}
            />
          </div>
        </>
      )}
    </div>

    {list && (
      <BatchUpdateModal
        open={batchUpdateOpen}
        listData={list}
        selectedRows={selectedRows}
        appCode={appCode}
        metaObjectCode={metaObjectCode}
        onSuccess={() => {
          setBatchUpdateOpen(false);
          setSelectedRows([]);
          setListKey(k => k + 1);
        }}
        onCancel={() => setBatchUpdateOpen(false)}
      />
    )}
    </>
  );
};

export default MetaView;
