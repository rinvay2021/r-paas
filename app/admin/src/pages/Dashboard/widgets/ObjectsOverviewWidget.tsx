import React from 'react';
import { Table, Typography } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import BaseWidget from './BaseWidget';
import type { WidgetProps, ObjectOverview } from '../types';
import { dashboardService } from '@/api/dashboard';

const { Link } = Typography;

const ObjectsOverviewWidget: React.FC<WidgetProps> = () => {
  const navigate = useNavigate();

  const { data, loading } = useRequest(
    () => dashboardService.getObjectsOverview({}),
    {
      cacheKey: 'dashboard-objects-overview',
      staleTime: 5 * 60 * 1000, // 5分钟缓存
    }
  );

  const objects: ObjectOverview[] = data?.data?.list || [];

  const columns = [
    {
      title: '对象名称',
      dataIndex: 'metaObjectName',
      key: 'metaObjectName',
      width: 200,
      ellipsis: true,
      render: (text: string, record: any) => (
        <Link onClick={() => navigate(`/app/${record.appCode}/meta/${record.metaObjectCode}/field`)}>
          {text}
        </Link>
      ),
    },
    {
      title: '应用',
      dataIndex: 'appCode',
      key: 'appCode',
      width: 150,
      ellipsis: true,
    },
    {
      title: '字段数',
      dataIndex: 'fieldCount',
      key: 'fieldCount',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '表单数',
      dataIndex: 'formCount',
      key: 'formCount',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '列表数',
      dataIndex: 'listCount',
      key: 'listCount',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '视图数',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '最后更新',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (date: Date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <BaseWidget
      title="对象概览"
      icon={<DatabaseOutlined />}
      loading={loading}
      id=""
    >
      <Table
        dataSource={objects}
        columns={columns}
        rowKey="metaObjectCode"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 个对象`,
        }}
        size="small"
      />
    </BaseWidget>
  );
};

export default ObjectsOverviewWidget;
