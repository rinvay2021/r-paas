import React from 'react';
import { Alert, List, Badge, Empty, Typography } from 'antd';
import { SafetyOutlined, CheckCircleOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import BaseWidget from './BaseWidget';
import type { WidgetProps, HealthCheckResult, HealthIssue } from '../types';
import { dashboardService } from '@/api/dashboard';

const { Text, Link } = Typography;

const ICON_MAP = {
  error: <WarningOutlined style={{ color: '#ff4d4f' }} />,
  warning: <InfoCircleOutlined style={{ color: '#faad14' }} />,
  info: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
};

const HealthCheckWidget: React.FC<WidgetProps> = () => {
  const { data, loading } = useRequest(
    () => dashboardService.getHealthCheck({}),
    {
      cacheKey: 'dashboard-health-check',
      staleTime: 30 * 60 * 1000, // 30分钟缓存
    }
  );

  const healthCheck: HealthCheckResult = data?.data || {
    disabledFields: 0,
    emptyForms: 0,
    viewsWithoutSearch: 0,
    fieldsWithoutDatasource: 0,
    emptyDatasources: 0,
    issues: [],
  };

  const totalIssues = healthCheck.issues.length;
  const hasIssues = totalIssues > 0;

  return (
    <BaseWidget
      title="健康检查"
      icon={<SafetyOutlined />}
      loading={loading}
      id=""
    >
      <div style={{ marginBottom: 16 }}>
        {!hasIssues ? (
          <Alert
            message="配置健康"
            description="所有配置项检查通过，未发现问题"
            type="success"
            icon={<CheckCircleOutlined />}
            showIcon
          />
        ) : (
          <Alert
            message={`发现 ${totalIssues} 个问题`}
            description="建议及时处理以下配置问题"
            type="warning"
            showIcon
          />
        )}
      </div>

      {hasIssues ? (
        <List
          dataSource={healthCheck.issues}
          renderItem={(item: HealthIssue) => (
            <List.Item style={{ padding: '12px 0' }}>
              <List.Item.Meta
                avatar={
                  <Badge
                    status={
                      item.type === 'error' ? 'error' :
                      item.type === 'warning' ? 'warning' : 'processing'
                    }
                  />
                }
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {ICON_MAP[item.type]}
                    <Text>{item.message}</Text>
                  </div>
                }
                description={
                  item.link && (
                    <Link href={item.link} target="_blank">
                      查看详情
                    </Link>
                  )
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无问题"
        />
      )}
    </BaseWidget>
  );
};

export default HealthCheckWidget;
