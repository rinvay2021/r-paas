import React from 'react';
import { Table, Tag, Button, Typography, Space, Drawer, Descriptions, Empty } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { taskApi, DataTask } from '@/api/task';

const { Title, Text } = Typography;

const STATUS_MAP = {
  pending: { label: '等待中', color: 'default' },
  processing: { label: '处理中', color: 'processing' },
  done: { label: '完成', color: 'success' },
  failed: { label: '失败', color: 'error' },
} as const;

const TYPE_MAP = {
  export: { label: '导出', color: 'blue' },
  import: { label: '导入', color: 'purple' },
} as const;

const TaskList: React.FC = () => {
  const { appCode } = useParams<{ appCode: string }>();
  const navigate = useNavigate();
  const [errorDrawer, setErrorDrawer] = React.useState<DataTask | null>(null);

  // 查询所有对象的任务（metaObjectCode 传空查全部，后端支持）
  const { data, loading, refresh } = useRequest(
    () => taskApi.getTasks({ appCode: appCode!, metaObjectCode: '' }),
    { refreshDeps: [appCode], pollingInterval: 5000 },
  );

  const tasks: DataTask[] = data?.data?.list || [];

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: keyof typeof TYPE_MAP) => (
        <Tag color={TYPE_MAP[type]?.color}>{TYPE_MAP[type]?.label}</Tag>
      ),
    },
    {
      title: '对象',
      dataIndex: 'metaObjectCode',
      key: 'metaObjectCode',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: keyof typeof STATUS_MAP) => (
        <Tag color={STATUS_MAP[status]?.color}>{STATUS_MAP[status]?.label}</Tag>
      ),
    },
    {
      title: '总行数',
      dataIndex: 'totalCount',
      key: 'totalCount',
      width: 80,
    },
    {
      title: '成功',
      dataIndex: 'successCount',
      key: 'successCount',
      width: 80,
      render: (v: number) => <Text type="success">{v}</Text>,
    },
    {
      title: '失败',
      dataIndex: 'failedCount',
      key: 'failedCount',
      width: 80,
      render: (v: number) => v > 0 ? <Text type="danger">{v}</Text> : <Text>{v}</Text>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_: any, record: DataTask) => (
        <Space>
          {record.type === 'export' && record.status === 'done' && record.fileUrl && (
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              href={taskApi.getDownloadUrl(record.fileUrl)}
              target="_blank"
            >
              下载
            </Button>
          )}
          {record.failedCount > 0 && (
            <Button
              type="link"
              size="small"
              danger
              onClick={() => setErrorDrawer(record)}
            >
              查看错误
            </Button>
          )}
          {record.errorMsg && (
            <Button type="link" size="small" danger onClick={() => setErrorDrawer(record)}>
              查看错误
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            type="text"
            onClick={() => navigate(-1)}
          >
            返回
          </Button>
          <Title level={4} style={{ margin: 0 }}>任务列表</Title>
        </Space>
        <Button icon={<ReloadOutlined />} onClick={refresh}>刷新</Button>
      </div>

      <Table
        dataSource={tasks}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 20, showTotal: t => `共 ${t} 条` }}
        size="middle"
        locale={{ emptyText: <Empty description="暂无任务" /> }}
      />

      {/* 错误明细 Drawer */}
      <Drawer
        title="错误明细"
        open={!!errorDrawer}
        onClose={() => setErrorDrawer(null)}
        width={600}
      >
        {errorDrawer && (
          <>
            <Descriptions size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="类型">{TYPE_MAP[errorDrawer.type]?.label}</Descriptions.Item>
              <Descriptions.Item label="对象">{errorDrawer.metaObjectCode}</Descriptions.Item>
              <Descriptions.Item label="总行数">{errorDrawer.totalCount}</Descriptions.Item>
              <Descriptions.Item label="失败行数">{errorDrawer.failedCount}</Descriptions.Item>
            </Descriptions>
            {errorDrawer.errorMsg && (
              <Text type="danger" style={{ display: 'block', marginBottom: 12 }}>
                {errorDrawer.errorMsg}
              </Text>
            )}
            {errorDrawer.errorDetails?.length > 0 && (
              <Table
                dataSource={errorDrawer.errorDetails}
                columns={[
                  { title: '行号', dataIndex: 'row', key: 'row', width: 80 },
                  { title: '字段', dataIndex: 'field', key: 'field', width: 100 },
                  { title: '错误原因', dataIndex: 'message', key: 'message' },
                ]}
                rowKey="row"
                size="small"
                pagination={{ pageSize: 20 }}
              />
            )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default TaskList;
