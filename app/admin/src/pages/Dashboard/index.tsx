import React, { useState } from 'react';
import { Row, Col } from 'antd';
import { WIDGET_REGISTRY, DEFAULT_LAYOUT } from './widgets/registry';
import './index.less';

const Dashboard: React.FC = () => {
  const [refreshKey] = useState(0);

  return (
    <div className="dashboard-container">
      <div className="dashboard-content" key={refreshKey}>
        {/* 统计卡片 */}
        <div className="dashboard-section">
          {(() => {
            const widget = DEFAULT_LAYOUT.find(w => w.widgetId === 'statistics-cards');
            if (!widget) return null;
            const WidgetComponent = WIDGET_REGISTRY[widget.widgetId].component;
            return <WidgetComponent id={widget.id} config={widget.config} />;
          })()}
        </div>

        {/* 最近操作 + 健康检查 */}
        <Row gutter={16} className="dashboard-section">
          <Col span={12}>
            {(() => {
              const widget = DEFAULT_LAYOUT.find(w => w.widgetId === 'recent-activities');
              if (!widget) return null;
              const WidgetComponent = WIDGET_REGISTRY[widget.widgetId].component;
              return (
                <div style={{ height: '420px' }}>
                  <WidgetComponent id={widget.id} config={widget.config} />
                </div>
              );
            })()}
          </Col>
          <Col span={12}>
            {(() => {
              const widget = DEFAULT_LAYOUT.find(w => w.widgetId === 'health-check');
              if (!widget) return null;
              const WidgetComponent = WIDGET_REGISTRY[widget.widgetId].component;
              return (
                <div style={{ height: '420px' }}>
                  <WidgetComponent id={widget.id} config={widget.config} />
                </div>
              );
            })()}
          </Col>
        </Row>

        {/* 对象概览 */}
        <div className="dashboard-section">
          {(() => {
            const widget = DEFAULT_LAYOUT.find(w => w.widgetId === 'objects-overview');
            if (!widget) return null;
            const WidgetComponent = WIDGET_REGISTRY[widget.widgetId].component;
            return (
              <div style={{ height: '420px' }}>
                <WidgetComponent id={widget.id} config={widget.config} />
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
