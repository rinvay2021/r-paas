import React from 'react';
import { List, Progress, Empty, Typography } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { useNavigate } from 'react-router-dom';
import BaseWidget from './BaseWidget';
import type { WidgetProps, HotObject } from '../types';
import { dashboardService } from '@/api/dashboard';

const { Text } = Typography;

const HotObjectsWidget: React.FC<WidgetProps> = ({ appCode, config }) => {
  const navigate = useNavigate();
  const limit = config?.limit || 5;

  const { data, loading } = useRequest(() => dashboardService.getHotObjects({ appCode, limit }), {
    ready: !!appCode,
    cacheKey: `dashboard-hot-objects-${appCode}`,
    staleTime: 10 * 60 * 1000, // 10分钟缓存
  });

  const hotObjects: HotObject[] = data?.data?.list || [];
  const maxVisits = hotObjects.length > 0 ? hotObjects[0].visits : 1;

  const handleClick = (metaObjectCode: string) => {
    navigate(`/app/${appCode}/meta/${metaObjectCode}/field`);
  };

  return (
    <BaseWidget title="热门对象" icon={<FireOutlined />} loading={loading} appCode={appCode} id="">
      {hotObjects.length === 0 ? (
        <Empty description="暂无数据" />
      ) : (
        <List
          dataSource={hotObjects}
          renderItem={(item, index) => {
            const percent = (item.visits / maxVisits) * 100;

            return (
              <List.Item
                style={{
                  padding: '12px 0',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#f5f5f5';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
                onClick={() => handleClick(item.metaObjectCode)}
              >
                <div style={{ width: '100%' }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}
                  >
                    <Text strong>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 24,
                          textAlign: 'center',
                          color: index < 3 ? '#faad14' : '#8c8c8c',
                          fontWeight: 600,
                        }}
                      >
                        {index + 1}.
                      </span>
                      {item.metaObjectName}
                    </Text>
                    <Text type="secondary">{item.visits} 次访问</Text>
                  </div>
                  <Progress
                    percent={percent}
                    showInfo={false}
                    strokeColor={{
                      '0%': '#ff4d4f',
                      '50%': '#faad14',
                      '100%': '#52c41a',
                    }}
                    size="small"
                  />
                </div>
              </List.Item>
            );
          }}
        />
      )}
    </BaseWidget>
  );
};

export default HotObjectsWidget;
