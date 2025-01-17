import { Space, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { formatDate } from '@r-paas/shared/moment';
import { BaseFieldListItem, BooleanEnum } from './type';

export const useColumns = (): ColumnsType<BaseFieldListItem> => [
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
  },
  {
    title: '是否启用',
    dataIndex: 'isEnabled',
    key: 'isEnabled',
    render: (_, record: BaseFieldListItem) =>
      record.isEnabled === BooleanEnum.YES ? (
        <Tag color="success">已启用</Tag>
      ) : (
        <Tag color="error">已禁用</Tag>
      ),
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
      return (
        <Space direction="horizontal" size="small">
          <a
            key="edit"
            onClick={() => {
              /* TODO: 处理编辑逻辑 */
            }}
          >
            编辑
          </a>
          <a
            key="delete"
            onClick={() => {
              /* TODO: 处理删除逻辑 */
            }}
          >
            删除
          </a>
          <a
            key="enable"
            onClick={() => {
              /* TODO: 处理启用逻辑 */
            }}
          >
            {record.isEnabled === BooleanEnum.YES ? '禁用' : '启用'}
          </a>
        </Space>
      );
    },
    fixed: 'right',
    width: 120,
  },
];
