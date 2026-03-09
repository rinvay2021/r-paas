import React from 'react';
import { find } from 'lodash';
import { Popconfirm, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { formatDate } from '@r-paas/shared/moment';
import { FunctionButtonListItem, ColumnsOperators } from './type';
import { BUTTON_LEVEL_OPTIONS, BUTTON_EVENT_TYPE_OPTIONS } from './constant';

export const useColumns = (operators: ColumnsOperators): ColumnsType<FunctionButtonListItem> => {
  const { handleEdit, handleDelete, handleEnable } = operators;

  return React.useMemo(() => {
    return [
      {
        title: '按钮名称',
        dataIndex: 'buttonName',
        key: 'buttonName',
      },
      {
        title: '按钮编码',
        dataIndex: 'buttonCode',
        key: 'buttonCode',
      },
      {
        title: '按钮描述',
        dataIndex: 'buttonDesc',
        key: 'buttonDesc',
        ellipsis: true,
      },
      {
        title: '按钮级别',
        dataIndex: 'buttonLevel',
        key: 'buttonLevel',
        render: (_, record: FunctionButtonListItem) => {
          const level = find(BUTTON_LEVEL_OPTIONS, option => option.value === record.buttonLevel);
          return level?.label;
        },
      },
      {
        title: '事件类型',
        dataIndex: 'buttonEventType',
        key: 'buttonEventType',
        render: (_, record: FunctionButtonListItem) => {
          const eventType = find(
            BUTTON_EVENT_TYPE_OPTIONS,
            option => option.value === record.buttonEventType
          );
          return eventType?.label;
        },
      },
      {
        title: '排序',
        dataIndex: 'buttonOrder',
        key: 'buttonOrder',
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (_, record: FunctionButtonListItem) => formatDate(record.createdAt),
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (_, record: FunctionButtonListItem) => formatDate(record.updatedAt),
      },
      {
        title: '操作',
        dataIndex: 'actions',
        key: 'actions',
        render: (_, record: FunctionButtonListItem) => {
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
              <Popconfirm
                title="确定要删除吗？"
                onConfirm={() => {
                  handleDelete?.(record);
                }}
              >
                <a key="delete">删除</a>
              </Popconfirm>
            </Space>
          );
        },
        fixed: 'right',
        width: 120,
      },
    ];
  }, [handleEdit, handleDelete, handleEnable]);
};
