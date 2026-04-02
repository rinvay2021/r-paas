import React from 'react';
import { find } from 'lodash';
import { Popconfirm, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { formatDate } from '@r-paas/shared/moment';
import { FIELD_TYPE_GROUPS } from './constant';
import { BaseFieldListItem, BooleanEnum, ColumnsOprators } from './type';

export const useColumns = (oprators: ColumnsOprators): ColumnsType<BaseFieldListItem> => {
  const { handleEdit, handleDelete, handleEnable } = oprators;

  return React.useMemo(() => {
    return [
      {
        title: '字段名称',
        dataIndex: 'fieldName',
        key: 'fieldName',
      },
      {
        title: '字段编码',
        dataIndex: 'fieldCode',
        key: 'fieldCode',
      },
      {
        title: '字段描述',
        dataIndex: 'fieldDesc',
        key: 'fieldDesc',
        ellipsis: true,
      },
      {
        title: '字段类型',
        dataIndex: 'fieldType',
        key: 'fieldType',
        render: (_, record: BaseFieldListItem) => {
          const group = find(FIELD_TYPE_GROUPS, group => group.type === record.fieldType);
          return group?.label;
        },
      },
      {
        title: '是否生效',
        dataIndex: 'isEnabled',
        key: 'isEnabled',
        render: (_, record: BaseFieldListItem) =>
          record.isEnabled === BooleanEnum.YES ? '生效中' : '已停用',
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (_, record: BaseFieldListItem) => formatDate(record.createdAt),
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (_, record: BaseFieldListItem) => formatDate(record.updatedAt),
      },
      {
        title: '操作',
        dataIndex: 'actions',
        key: 'actions',
        render: (_, record: BaseFieldListItem) => {
          const isEnabled = record.isEnabled === BooleanEnum.YES;

          return (
            <Space direction="horizontal" size="small">
              <a
                key="edit"
                style={{ color: 'inherit' }}
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
                <a key="delete" style={{ color: "inherit" }}>删除</a>
              </Popconfirm>
              <Popconfirm
                title={isEnabled ? '确定要停用吗？' : '确定要启用吗？'}
                onConfirm={() => {
                  handleEnable?.(record);
                }}
              >
                <a key="enable" style={{ color: "inherit" }}>{isEnabled ? "停用" : "启用"}</a>
              </Popconfirm>
            </Space>
          );
        },
        fixed: 'right',
        width: 160,
      },
    ];
  }, [handleEdit, handleDelete, handleEnable]);
};
