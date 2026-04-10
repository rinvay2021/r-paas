import React from 'react';
import { Table, Tag, Button, Space, Drawer, Descriptions, Select, Row, Col, Form, theme, Typography } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { dataApi } from '@/api/data';

const { Text } = Typography;
const LABEL_STYLE = { style: { whiteSpace: 'nowrap' as const, width: 48, flexShrink: 0 } };
const WRAPPER_STYLE = { style: { flex: 1, minWidth: 0 } };

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

type TaskStatus = keyof typeof STATUS_MAP;
type TaskType = keyof typeof TYPE_MAP;

interface DataTask {
  _id: string;
  type: TaskType;
  status: TaskStatus;
  appCode: string;
  metaObjectCode: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  createdAt: string;
  fileUrl?: string;
  fileName?: string;
  errorMsg?: string;
  errorDetails?: Array<{ row: number; field?: string; message: string }>;
}

const BASE_URL = 'http://localhost:8080/api/v1';

const TaskListPage: React.FC = () => {
  const { token } = theme.useToken();
  const urlParams = new URLSearchParams(window.location.search);
  const appCode = urlParams.get('appCode') || '';

  const [form] = Form.useForm();
  const [filterType, setFilterType] = React.useState<TaskType | undefined>(undefined);
  const [filterStatus, setFilterStatus] = React.useState<TaskStatus | undefined>(undefined);
  const [errorDrawer, setErrorDrawer] = React.useState<DataTask | null>(null);

  const { data, loading, refresh } = useRequest(
    () => dataApi.getTasks({ appCode }),
    { refreshDeps: [appCode] },
  );

  const allTasks: DataTask[] = (data as any)?.data?.list || [];

  const tasks = allTasks.filter(t => {
    if (filterType && t.type !== filterType) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    return true;
  });

  const handleSearch = () => {
    const values = form.getFieldsValue();
    setFilterType(values.type || undefined);
    setFilterStatus(values.status || undefined);
    refresh();
  };

  const handleReset = () => {
    form.resetFields();
    setFilterType(undefined);
    setFilterStatus(undefined);
    refresh();
  };

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: TaskType) => (
        <Tag color={TYPE_MAP[type]?.color}>{TYPE_MAP[type]?.label}</Tag>
      ),
    },
    {
      title: '对象',
      dataIndex: 'metaObjectCode',
      key: 'metaObjectCode',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: TaskStatus) => (
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
              href={`${BASE_URL}/data/export/download/${encodeURIComponent(record.fileUrl)}`}
              target="_blank"
            >
              下载
            </Button>
          )}
          {(record.failedCount > 0 || record.errorMsg) && (
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
      {/* 搜索表单 */}
      <div style={{ background: token.colorBgContainer, borderRadius: token.borderRadius, marginBottom: 8 }}>
        <Form form={form} layout="inline">
          <Row gutter={[16, 0]} style={{ width: '100%' }}>
            <Col span={6}>
              <Form.Item
                name="type"
                label="类型"
                style={{ marginBottom: 12, width: '100%' }}
                labelCol={LABEL_STYLE}
                wrapperCol={WRAPPER_STYLE}
              >
                <Select
                  allowClear
                  placeholder="全部"
                  options={[
                    { label: '导出', value: 'export' },
                    { label: '导入', value: 'import' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="status"
                label="状态"
                style={{ marginBottom: 12, width: '100%' }}
                labelCol={LABEL_STYLE}
                wrapperCol={WRAPPER_STYLE}
              >
                <Select
                  allowClear
                  placeholder="全部"
                  options={[
                    { label: '等待中', value: 'pending' },
                    { label: '处理中', value: 'processing' },
                    { label: '完成', value: 'done' },
                    { label: '失败', value: 'failed' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 12 }}>
              <Space>
                <Button onClick={handleReset}>重置</Button>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </div>

      <Table
        dataSource={tasks}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 20, showTotal: t => `共 ${t} 条` }}
        size="middle"
      />

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
            {errorDrawer.errorDetails && errorDrawer.errorDetails.length > 0 && (
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

export default TaskListPage;
