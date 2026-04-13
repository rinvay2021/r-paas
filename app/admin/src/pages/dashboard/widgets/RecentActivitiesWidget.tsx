import React from 'react';
import { List, Tag, Typography, Empty, Button } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import zhCN from 'dayjs/locale/zh-cn.js';
import BaseWidget from './BaseWidget';
import type { WidgetProps, RecentActivity } from '../types';
import { dashboardService } from '@/api/dashboard';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn', zhCN);

const { Text } = Typography;

const ACTION_TYPE_MAP: Record<string, { label: string; color: string }> = {
  create: { label: '创建', color: 'green' },
  update: { label: '更新', color: 'default' },
  delete: { label: '删除', color: 'red' },
};

const TARGET_TYPE_MAP: Record<string, string> = {
  field: '字段',
  form: '表单',
  list: '列表',
  view: '视图',
  detailPage: '详情页',
  searchForm: '搜索表单',
  button: '按钮',
  datasource: '数据源',
};

const RecentActivitiesWidget: React.FC<WidgetProps> = ({ config }) => {
  const limit = config?.limit || 10;

  const { data, loading, refresh } = useRequest(
    () => dashboardService.getRecentActivities({ limit }),
    {
      pollingInterval: 30000, // 30秒轮询
    }
  );

  const activities: RecentActivity[] = data?.data?.list || [];

  return (
    <BaseWidget
      title="最近操作"
      icon={<ClockCircleOutlined />}
      loading={loading}
      id=""
      extra={
        <Button type="link" size="small" onClick={refresh}>
          刷新
        </Button>
      }
    >
      {activities.length === 0 ? (
        <Empty description="暂无操作记录" />
      ) : (
        <List
          dataSource={activities}
          renderItem={item => {
            const actionConfig = ACTION_TYPE_MAP[item.action] || { label: item.action, color: 'default' };
            const targetType = TARGET_TYPE_MAP[item.targetType] || item.targetType;

            return (
              <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <List.Item.Meta
                  title={
                    <div>
                      <Tag color={actionConfig.color}>{actionConfig.label}</Tag>
                      <Text strong>{targetType}</Text>
                      <Text style={{ marginLeft: 8 }}>"{item.targetName}"</Text>
                    </div>
                  }
                  description={
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.metaObjectName}
                      </Text>
                      <Text type="secondary" style={{ marginLeft: 16, fontSize: 12 }}>
                        {dayjs(item.createdAt).fromNow()}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </BaseWidget>
  );
};

export default RecentActivitiesWidget;
