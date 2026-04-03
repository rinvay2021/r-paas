import React from 'react';
import { Table, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { ListData, ActionButton } from '@/api/renderer/interface';
import { dataApi } from '@/api/data';
import MetaActionButtons from '@/components/MetaActionButtons';

interface MetaListProps {
  listData: ListData;
  appCode: string;
  metaObjectCode: string;
  onButtonClick?: (btn: ActionButton, record: any) => void;
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
  refreshKey,
  searchParams,
  scrollY,
}) => {
  const config = listData.listConfig || {};
  const frozenColumnNum = config.frozenColumnNum || 0;
  const defaultPageSize = config.pageSize || 10;

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);

  const { data, loading, refresh } = useRequest(
    () => dataApi.query({ appCode, metaObjectCode, page, pageSize, searchParams }),
    { refreshDeps: [appCode, metaObjectCode, page, pageSize, searchParams] },
  );

  // refreshKey 变化时回到第1页重新查询
  React.useEffect(() => {
    if (refreshKey !== undefined) {
      setPage(1);
      refresh();
    }
  }, [refreshKey]);

  const records: any[] = data?.data?.list || [];
  const total: number = data?.data?.total || 0;

  const visibleFields = (listData.listFields || [])
    .filter((lf) => lf.isVisible !== false)
    .sort((a, b) => a.sort - b.sort);

  const rowButtons: ActionButton[] = (
    (config.buttons as ActionButton[]) || []
  ).filter((btn) => btn.buttonLevel === 'ListRow');

  const showActionsCol = config.showActions && rowButtons.length > 0;

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
        // 数据库里字段 key 是 fieldCode，列表字段的 name 存的是字段名（中文），
        // field.fieldCode 才是真实的数据 key
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
              onButtonClick={onButtonClick}
            />
          ),
        }]
      : []),
  ];

  return (
    <Table
      columns={columns}
      dataSource={records}
      rowKey="_id"
      loading={loading}
      rowSelection={config.showCheckbox ? { type: 'checkbox' } : undefined}
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
  );
};

export default MetaList;
