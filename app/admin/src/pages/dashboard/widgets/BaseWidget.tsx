import React from 'react';
import { Card, Space } from 'antd';
import type { WidgetProps } from '../types';

export interface BaseWidgetProps extends WidgetProps {
  title: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}

const BaseWidget: React.FC<BaseWidgetProps> = ({
  title,
  icon,
  extra,
  loading,
  children,
}) => {
  return (
    <Card
      className="dashboard-widget"
      title={
        icon ? (
          <Space>
            {icon}
            <span>{title}</span>
          </Space>
        ) : (
          title
        )
      }
      extra={extra}
      loading={loading}
      bordered={false}
      style={{ height: '100%' }}
      styles={{
        body: { height: 'calc(100% - 57px)', padding: 16, overflow: 'auto' },
      }}
    >
      {children}
    </Card>
  );
};

export default BaseWidget;
