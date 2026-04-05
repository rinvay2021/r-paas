import React from 'react';
import { Table, Tooltip, message } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { ListData, ActionButton } from '@/api/renderer/interface';
import { ButtonLevel, ButtonEvent } from '@r-paas/meta';
import { dataApi } from '@/api/data';
import MetaActionButtons from '@/components/MetaActionButtons';
import BatchUpdateModal from '@/components/BatchUpdateModal';

interface MetaListProps {
  listData: ListData;
  appCode: string;
  metaObjectCode: string;
  /** 行级按钮点击回调（外部可额外处理，如 Update 打开表单） */
  onButtonClick?: (btn: ActionButton, record: any) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
  refreshKey?: number;
  searchParams?: Array<{ fieldCode: string; condition: string; value: any }>;
  scrollY?: number;
}

/** 列头标题：有 helpTip 时加 Tooltip */
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

const MetaList: React.FC<MetaListProps> = ({
  listData,
  appCode,
  metaObjectCode,
  onButtonClick,
  onSelectionChange,
  refreshKey,
  searchParams,
  scrollY,
}) => {
  const config = listData.listConfig || {};
  const frozenColumnNum = config.frozenColumnNum || 0;
  const defaultPageSize = config.pageSize || 10;

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = React.useState<any[]>([]);
  const [batchUpdateOpen, setBatchUpdateOpen] = React.useState(false);

  const { data, loading, refresh } = useRequest(
    () => dataApi.query({ appCode, metaObjectCode, page, pageSize, searchParams }),
    { refreshDeps: [appCode, metaObjectCode, page, pageSize, searchParams] },
  );

  // refreshKey 变化时回到第1页重新查询，同时清空选中
  React.useEffect(() => {
    if (refreshKey !== undefined) {
      setPage(1);
      setSelectedRowKeys([]);
      setSelectedRows([]);
      onSelectionChange?.([]);
      refresh();
    }
  }, [refreshKey]);

  const refreshList = () => {
    setPage(1);
    setSelectedRowKeys([]);
    setSelectedRows([]);
    onSelectionChange?.([]);
    refresh();
  };

  const records: any[] = data?.data?.list || [];
  const total: number = data?.data?.total || 0;

  const visibleFields = (listData.listFields || [])
    .filter((lf) => lf.isVisible !== false)
    .sort((a, b) => a.sort - b.sort);

  // List 级按钮（顶部操作栏）
  const listButtons: ActionButton[] = (
    (config.buttons as ActionButton[]) || []
  ).filter((btn) => btn.buttonLevel === ButtonLevel.List);

  // ListRow 级按钮（操作列）
  const rowButtons: ActionButton[] = (
    (config.buttons as ActionButton[]) || []
  ).filter((btn) => btn.buttonLevel === ButtonLevel.ListRow);

  const showActionsCol = config.showActions && rowButtons.length > 0;

  // List 级按钮事件处理
  const handleListButtonClick = async (btn: ActionButton) => {
    if (btn.buttonEvent === ButtonEvent.Create && btn.buttonConfig?.formCode) {
      const openForm = (window as any).__openFormModal;
      if (openForm) openForm({ appCode, metaObjectCode, formCode: btn.buttonConfig.formCode });

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

  // 行级按钮事件处理（Delete 在列表内处理，其他透传给外部）
  const handleRowButtonClick = async (btn: ActionButton, record: any) => {
    if (btn.buttonEvent === ButtonEvent.Delete && record?._id) {
      try {
        await dataApi.delete({ appCode, metaObjectCode, id: record._id });
        message.success('删除成功');
        refreshList();
      } catch (err: any) {
        message.error(err?.message || '删除失败');
      }
    } else {
      // Update 等事件透传给外部（如 MetaView 打开编辑表单）
      onButtonClick?.(btn, record);
    }
  };

  const columns: ColumnsType<any> = [
    ...(config.showIndex
      ? [{
          title: '#',
          dataIndex: '_index',
          key: '_index',
          width: 55,
          fixed: frozenColumnNum > 0 ? 'left' as const : undefined,
          render: (_: any, __: any, idx: number) => (page - 1) * pageSize + idx + 1,
        }]
      : []),

    ...visibleFields.map((lf, idx) => {
      const col: ColumnType<any> = {
        title: renderTitle(lf.displayName || lf.name, lf.showHelp, lf.helpTip),
        dataIndex: lf.field?.fieldCode || lf.name,
        key: lf.field?.fieldCode || lf.name,
        width: lf.width || undefined,
        align: (lf.align as any) || 'left',
        ellipsis: true,
      };
      if (frozenColumnNum > 0 && idx < frozenColumnNum) {
        col.fixed = 'left';
      }
      return col;
    }),

    ...(showActionsCol
      ? [{
          title: '操作',
          key: '_actions',
          width: 120,
          fixed: config.frozenColumn ? 'right' as const : undefined,
          render: (_: any, record: any) => (
            <MetaActionButtons
              buttons={rowButtons}
              level="row"
              record={record}
              onButtonClick={handleRowButtonClick}
            />
          ),
        }]
      : []),
  ];

  return (
    <>
      {/* List 级按钮 */}
      {listButtons.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <MetaActionButtons
            buttons={listButtons}
            level="page"
            onButtonClick={handleListButtonClick}
            onBeforeConfirm={(btn) => {
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
        rowSelection={config.showCheckbox ? {
          type: 'checkbox',
          selectedRowKeys,
          onChange: (keys, rows) => {
            setSelectedRowKeys(keys);
            setSelectedRows(rows);
            onSelectionChange?.(rows);
          },
        } : undefined}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
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
    </>
  );
};

export default MetaList;
