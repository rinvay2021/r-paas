import React from 'react';
import { Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { formatDate } from '@r-paas/shared/moment';
import type { DatasourceListItem, ColumnsOperators } from './type';

export const useColumns = (operators: ColumnsOperators): ColumnsType<DatasourceListItem> => {
  const { handleEdit, handleDelete } = operators;

  return React.useMemo(() => {
    return [
      {
        title: '数据源名称',
        dataIndex: 'datasourceName',
        key: 'datasourceName',
        width: 200,
      },
      {
        title: '数据源编码',
        dataIndex: 'datasourceCode',
        key: 'datasourceCode',
        width: 200,
      },
      {
        title: '描述',
        dataIndex: 'datasourceDesc',
        key: 'datasourceDesc',
        ellipsis: true,
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        render: (_, record: DatasourceListItem) => formatDate(record.createdAt),
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 180,
        render: (_, record: DatasourceListItem) => formatDate(record.updatedAt),
      },
      {
        title: '操作',
        dataIndex: 'actions',
        key: 'actions',
        fixed: 'right',
        width: 120,
        render: (_, record: DatasourceListItem) => {
          return (
            <Space direction="horizontal" size="small">
              <a
                key="edit"
                onClick={() => {
                  handleEdit?.(record);
                }}
              >
                编辑
              </a>
              <a
                key="delete"
                onClick={() => {
                  handleDelete?.(record);
                }}
              >
                删除
              </a>
            </Space>
          );
        },
      },
    ];
  }, [handleEdit, handleDelete]);
};
