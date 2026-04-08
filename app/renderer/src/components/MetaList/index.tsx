import React from 'react';
import { Table, Tooltip, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { ListData, ActionButton } from '@/api/renderer/interface';
import { ButtonLevel } from '@r-paas/meta';
import { dataApi } from '@/api/data';
import { portalBus } from '@/utils/portalBus';
import MetaActionButtons from '@/components/MetaActionButtons';

const RENDERER_ORIGIN = 'http://localhost:3005';
const TABLE_HEADER_HEIGHT = 46 + 48;
const TABLE_PAGINATION_HEIGHT = 74;

interface ListFieldConfig {
  linkable?: boolean;
  openMode?: 'overlay' | 'newPage' | 'push';
  detailPageCode?: string;
}

function handleFieldLink(fieldConfig: ListFieldConfig, record: any, appCode: string, metaObjectCode: string) {
  const { openMode, detailPageCode } = fieldConfig;
  if (!detailPageCode) return;
  const params = new URLSearchParams({ appCode, metaObjectCode, detailPageCode, ...(record._id ? { recordId: record._id } : {}) });
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
  overrideButtons?: ActionButton[];
  fixedHeight?: number;
  onRefreshReady?: (fn: () => void) => void;
}

const MetaList: React.FC<MetaListProps> = ({ listData, searchParams, overrideButtons, fixedHeight, onRefreshReady }) => {
  const { appCode, metaObjectCode } = listData;
  const config = listData.listConfig || {};
  const defaultPageSize = config.pageSize || 10;
  const frozenColumnNum = config.frozenColumnNum || 0;

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = React.useState<any[]>([]);

  // scrollY
  const tableWrapRef = React.useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = React.useState<number | undefined>(undefined);

  const calcScrollY = React.useCallback(() => {
    if (fixedHeight === 0) return;
    if (!tableWrapRef.current) return;
    const top = tableWrapRef.current.getBoundingClientRect().top;
    const available = window.innerHeight - top - TABLE_HEADER_HEIGHT - TABLE_PAGINATION_HEIGHT;
    setScrollY(available > 100 ? available : undefined);
  }, [fixedHeight]);

  React.useEffect(() => {
    if (fixedHeight === 0) { setScrollY(undefined); return; }
    const timer = requestAnimationFrame(calcScrollY);
    window.addEventListener('resize', calcScrollY);
    const observer = new ResizeObserver(calcScrollY);
    if (tableWrapRef.current) observer.observe(tableWrapRef.current);
    return () => {
      cancelAnimationFrame(timer);
      window.removeEventListener('resize', calcScrollY);
      observer.disconnect();
    };
  }, [calcScrollY, fixedHeight]);

  const { data, loading, refresh } = useRequest(
    () => dataApi.query({ appCode, metaObjectCode, page, pageSize, searchParams }),
    { refreshDeps: [appCode, metaObjectCode, page, pageSize, searchParams] }
  );

  const refreshList = React.useCallback(() => {
    setPage(1);
    setSelectedRowKeys([]);
    setSelectedRows([]);
    refresh();
  }, [refresh]);

  // 暴露 refreshList 给父组件（MetaView 用）
  React.useEffect(() => {
    onRefreshReady?.(refreshList);
  }, [refreshList, onRefreshReady]);

  const records: any[] = data?.data?.list || [];
  const total: number = data?.data?.total || 0;

  const effectiveButtons: ActionButton[] = overrideButtons ?? ((config.buttons as ActionButton[]) || []);
  const listButtons = effectiveButtons.filter(btn => btn.buttonLevel === ButtonLevel.List);
  const rowButtons = effectiveButtons.filter(btn => btn.buttonLevel === ButtonLevel.ListRow);
  const showActionsCol = config.showActions && rowButtons.length > 0;

  const visibleFields = (listData.listFields || [])
    .filter(lf => lf.isVisible !== false)
    .sort((a, b) => a.sort - b.sort);

  const columns: ColumnsType<any> = [
    ...(config.showIndex ? [{
      title: '#', dataIndex: '_index', key: '_index', width: 55,
      fixed: frozenColumnNum > 0 ? ('left' as const) : undefined,
      render: (_: any, __: any, idx: number) => (page - 1) * pageSize + idx + 1,
    }] : []),

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
        ...(isLinkable ? {
          render: (val: any, record: any) => (
            <Typography.Link
              onClick={() => handleFieldLink(fieldConfig!, record, appCode, metaObjectCode)}
              style={{ color: '#1a1a1a' }}
            >
              {val ?? '—'}
            </Typography.Link>
          ),
        } : {}),
      };
      if (frozenColumnNum > 0 && idx < frozenColumnNum) col.fixed = 'left';
      return col;
    }),

    ...(showActionsCol ? [{
      title: '操作', key: '_actions', width: 120,
      fixed: config.frozenColumn ? ('right' as const) : undefined,
      render: (_: any, record: any) => (
        <MetaActionButtons
          buttons={rowButtons}
          variant="inline"
          mode="listRow"
          record={record}
          afterAction={refreshList}
        />
      ),
    }] : []),
  ];

  return (
    <div ref={tableWrapRef} style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {listButtons.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, flexShrink: 0 }}>
          <MetaActionButtons
            buttons={listButtons}
            variant="block"
            mode="list"
            listData={listData}
            selectedRows={selectedRows}
            afterAction={refreshList}
          />
        </div>
      )}

      <Table
        columns={columns}
        dataSource={records}
        rowKey="_id"
        loading={loading}
        rowSelection={config.showCheckbox ? {
          type: 'checkbox',
          selectedRowKeys,
          onChange: (keys, rows) => { setSelectedRowKeys(keys); setSelectedRows(rows); },
        } : undefined}
        pagination={{
          current: page, pageSize, total,
          showSizeChanger: true, showQuickJumper: true,
          showTotal: t => `共 ${t} 条`,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
        scroll={{ x: 'max-content', y: scrollY }}
        size="middle"
        bordered={false}
      />
    </div>
  );
};

export default MetaList;
