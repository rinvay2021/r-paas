import React from 'react';
import { Row, Col, Statistic, Card, Spin } from 'antd';
import {
  DatabaseOutlined,
  FileTextOutlined,
  FormOutlined,
  UnorderedListOutlined,
  EyeOutlined,
  ControlOutlined,
  ApiOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import type { WidgetProps, StatisticsData } from '../types';
import { dashboardService } from '@/api/dashboard';

const STAT_CONFIGS = [
  {
    key: 'metaObjectCount',
    title: '元数据对象',
    icon: <DatabaseOutlined style={{ fontSize: 20, color: '#1890ff' }} />,
  },
  {
    key: 'fieldCount',
    title: '字段总数',
    icon: <FileTextOutlined style={{ fontSize: 20, color: '#52c41a' }} />,
  },
  {
    key: 'formCount',
    title: '表单总数',
    icon: <FormOutlined style={{ fontSize: 20, color: '#faad14' }} />,
  },
  {
    key: 'listCount',
    title: '列表总数',
    icon: <UnorderedListOutlined style={{ fontSize: 20, color: '#13c2c2' }} />,
  },
  {
    key: 'viewCount',
    title: '视图总数',
    icon: <EyeOutlined style={{ fontSize: 20, color: '#722ed1' }} />,
  },
  {
    key: 'buttonCount',
    title: '按钮总数',
    icon: <ControlOutlined style={{ fontSize: 20, color: '#eb2f96' }} />,
  },
  {
    key: 'datasourceCount',
    title: '数据源总数',
    icon: <ApiOutlined style={{ fontSize: 20, color: '#fa8c16' }} />,
  },
];

const StatisticsCardsWidget: React.FC<WidgetProps> = () => {
  const { data, loading } = useRequest(
    () => dashboardService.getStatistics({}),
    {
      cacheKey: 'dashboard-statistics',
      staleTime: 5 * 60 * 1000, // 5分钟缓存
    }
  );

  const statistics: StatisticsData = data?.data || {
    metaObjectCount: 0,
    fieldCount: 0,
    formCount: 0,
    listCount: 0,
    viewCount: 0,
    buttonCount: 0,
    datasourceCount: 0,
    growth: {
      metaObject: 0,
      field: 0,
      form: 0,
      list: 0,
      view: 0,
      button: 0,
      datasource: 0,
    },
  };

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin />
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {STAT_CONFIGS.map(config => {
        const value = statistics[config.key] || 0;
        const growthKey = config.key.replace('Count', '') as keyof typeof statistics.growth;
        const growth = statistics.growth[growthKey] || 0;

        return (
          <Col xs={24} sm={12} md={8} lg={6} xl={6} key={config.key}>
            <Card
              bordered
              bodyStyle={{ padding: '16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                {config.icon}
                <span style={{ marginLeft: 8, fontSize: 14, color: '#595959' }}>{config.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#262626' }}>
                  {value}
                </div>
                {growth !== 0 && (
                  <div style={{ fontSize: 12, color: '#8c8c8c', whiteSpace: 'nowrap', marginLeft: 8 }}>
                    较上周 {growth > 0 ? (
                      <>
                        <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                        <span style={{ color: '#52c41a', marginLeft: 4 }}>{growth}</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownOutlined style={{ color: '#f5222d', fontSize: 12 }} />
                        <span style={{ color: '#f5222d', marginLeft: 4 }}>{Math.abs(growth)}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default StatisticsCardsWidget;
