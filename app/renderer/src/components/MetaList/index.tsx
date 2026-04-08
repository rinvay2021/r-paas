import React from 'react';
import { Table, Tooltip, message, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { ListData, ActionButton } from '@/api/renderer/interface';
import { ButtonLevel, ButtonEvent } from '@r-paas/meta';
import { dataApi } from '@/api/data';
import { portalBus } from '@/utils/portalBus';
import MetaActionButtons from '@/components/MetaActionButtons';
import BatchUpdateModal from '@/components/BatchUpdateModal';

// wujie 沙箱里 window.location.origin 是 portal 的域，需要写死 renderer 地址
const RENDERER_ORIGIN = 'http://localhost:3005';

// 表格 thead + pagination 高度
const TABLE_HEADER_HEIGHT = 46 + 48;
const TABLE_PAGINATION_HEIGHT = 74;

interface ListFieldConfig {
  linkable?: boolean;
  openMode?: 'overlay' | 'newPage' | 'push';
  detailPageCode?: string;
}

function handleFieldLink(
  fieldConfig: ListFieldConfig,
  record: any,
  appCode: string,
  metaObjectCode: string
) {
  const { openMode, detailPageCode } = fieldConfig;
  if (!detailPageCode) return;
  const params = new URLSearchParams({
    appCode,
    metaObjectCode,
    detailPageCode,
    ...(record._id ? { recordId: record._id } : {}),
  });
  const url = `${RENDERER_ORIGIN}/?${params.toString()}`;
  const title = record[Object.keys(record).find(k => !k.startsWith('_')) || ''];
  if (openMode === 'newPage') portalBus.openNewPage(url);
  else if (openMode === 'push') portalBus.pushDrawer({ url, title });
  else portalBus.overlayNavigate(url);
}

function renderTitle(displayName: string, showHelp?: boolean, helpTip?: string) {
  if (showHelp && helpTip) {
    return (
      <span>
        {displayName}
        <Tooltip title={helpTip}>
          <QuestionCircleOutlined style={{ marginLeft: 4, color: '#8c8c8c', fontSize: 12 }} />
        </Tooltip>
      </span>
    );
  }
  return displayName;
}

interface MetaListProps {
  listData: ListData;
  searchParams?: Array<{ fieldCode: string; condition: string; value: any }>;
}

const MetaList: React.FC<MetaListProps> = ({ listData, searchParams }) => {
  const { appCode, metaObjectCode } = listData;
  const config = listData.listConfig || {};
  const defaultPageSize = config.pageSize || 10;
  const frozenColumnNum = config.frozenColumnNum || 0;

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = React.useState<any[]>([]);
  const [batchUpdateOpen, setBatchUpdateOpen] = React.useState(false);

  // scrollY 计算
  const tableWrapRef = React.useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = React.useState<number | undefined>(undefined);

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
  }, [calcScrollY]);

  const { data, loading, refresh } = useRequest(
    () => dataApi.query({ appCode, metaObjectCode, page, pageSize, searchParams }),
    { refreshDeps: [appCode, metaObjectCode, page, pageSize, searchParams] }
  );

  const refreshList = () => {
    setPage(1);
    setSelectedRowKeys([]);
    setSelectedRows([]);
    refresh();
  };

  // 注册全局刷新函数，供 FormPage 提交后调用
  React.useEffect(() => {
    (window as any).__notifyListRefresh = refreshList;
    return () => {
      delete (window as any).__notifyListRefresh;
    };
  }, []);

  const records: any[] = data?.data?.list || [];
  const total: number = data?.data?.total || 0;

  const visibleFields = (listData.listFields || [])
    .filter(lf => lf.isVisible !== false)
    .sort((a, b) => a.sort - b.sort);

  const listButtons: ActionButton[] = ((config.buttons as ActionButton[]) || []).filter(
    btn => btn.buttonLevel === ButtonLevel.List
  );

  const rowButtons: ActionButton[] = ((config.buttons as ActionButton[]) || []).filter(
    btn => btn.buttonLevel === ButtonLevel.ListRow
  );

  const showActionsCol = config.showActions && rowButtons.length > 0;

  const handleListButtonClick = async (btn: ActionButton) => {
    if (btn.buttonEvent === ButtonEvent.Create && btn.buttonConfig?.formCode) {
      portalBus.openFormModal({ appCode, metaObjectCode, formCode: btn.buttonConfig.formCode });
    } else if (btn.buttonEvent === ButtonEvent.BatchUpdate) {
      if (selectedRows.length === 0) {
        message.warning('请先勾选要编辑的记录');
        return;
      }
      setBatchUpdateOpen(true);
    } else if (btn.buttonEvent === ButtonEvent.BatchDelete) {
      if (selectedRows.length === 0) {
        message.warning('请先勾选要删除的记录');
        return;
      }
      try {
        const ids = selectedRows.map(r => r._id).filter(Boolean);
        await dataApi.batchDelete({ appCode, metaObjectCode, ids });
        message.success(`已删除 ${ids.length} 条记录`);
        refreshList();
      } catch (err: any) {
        message.error(err?.message || '批量删除失败');
      }
    }
  };

  const handleRowButtonClick = async (btn: ActionButton, record: any) => {
    if (btn.buttonEvent === ButtonEvent.Delete && record?._id) {
      try {
        await dataApi.delete({ appCode, metaObjectCode, id: record._id });
        message.success('删除成功');
        refreshList();
      } catch (err: any) {
        message.error(err?.message || '删除失败');
      }
    } else if (
      btn.buttonEvent === ButtonEvent.Update &&
      btn.buttonConfig?.formCode &&
      record?._id
    ) {
      portalBus.openFormModal({
        appCode,
        metaObjectCode,
        formCode: btn.buttonConfig.formCode,
        recordId: record._id,
      });
    }
  };

  const columns: ColumnsType<any> = [
    ...(config.showIndex
      ? [
          {
            title: '#',
            dataIndex: '_index',
            key: '_index',
            width: 55,
            fixed: frozenColumnNum > 0 ? ('left' as const) : undefined,
            render: (_: any, __: any, idx: number) => (page - 1) * pageSize + idx + 1,
          },
        ]
      : []),

    ...visibleFields.map((lf, idx) => {
      const fieldConfig = (lf as any).fieldConfig as ListFieldConfig | undefined;
      const isLinkable = fieldConfig?.linkable && fieldConfig?.detailPageCode;
      const dataKey = lf.field?.fieldCode || lf.name;
      const col: ColumnType<any> = {
        title: renderTitle(lf.displayName || lf.name, lf.showHelp, lf.helpTip),
        dataIndex: dataKey,
        key: dataKey,
        width: lf.width || undefined,
        align: (lf.align as any) || 'left',
        ellipsis: true,
        ...(isLinkable
          ? {
              render: (val: any, record: any) => (
                <Typography.Link
                  onClick={() => handleFieldLink(fieldConfig!, record, appCode, metaObjectCode)}
                  style={{ color: '#1a1a1a' }}
                >
                  {val ?? '—'}
                </Typography.Link>
              ),
            }
          : {}),
      };
      if (frozenColumnNum > 0 && idx < frozenColumnNum) col.fixed = 'left';
      return col;
    }),

    ...(showActionsCol
      ? [
          {
            title: '操作',
            key: '_actions',
            width: 120,
            fixed: config.frozenColumn ? ('right' as const) : undefined,
            render: (_: any, record: any) => (
              <MetaActionButtons
                buttons={rowButtons}
                level="row"
                record={record}
                onButtonClick={handleRowButtonClick}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <div
      ref={tableWrapRef}
      style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {listButtons.length > 0 && (
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, flexShrink: 0 }}
        >
          <MetaActionButtons
            buttons={listButtons}
            level="page"
            onButtonClick={handleListButtonClick}
            onBeforeConfirm={btn => {
              if (btn.buttonEvent === ButtonEvent.BatchDelete) return selectedRows.length > 0;
              return true;
            }}
          />
        </div>
      )}

      <Table
        columns={columns}
        dataSource={records}
        rowKey="_id"
        loading={loading}
        rowSelection={
          config.showCheckbox
            ? {
                type: 'checkbox',
                selectedRowKeys,
                onChange: (keys, rows) => {
                  setSelectedRowKeys(keys);
                  setSelectedRows(rows);
                },
              }
            : undefined
        }
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: t => `共 ${t} 条`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
        scroll={{ x: 'max-content', y: scrollY }}
        size="middle"
        bordered={false}
      />

      <BatchUpdateModal
        open={batchUpdateOpen}
        listData={listData}
        selectedRows={selectedRows}
        appCode={appCode}
        metaObjectCode={metaObjectCode}
        onSuccess={() => {
          setBatchUpdateOpen(false);
          refreshList();
        }}
        onCancel={() => setBatchUpdateOpen(false)}
      />
    </div>
  );
};

export default MetaList;
