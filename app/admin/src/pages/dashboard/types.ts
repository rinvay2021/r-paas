import React from 'react';

/** Widget 配置 */
export interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<WidgetProps>;
  defaultSize: { w: number; h: number; minW?: number; minH?: number };
  category: 'statistics' | 'chart' | 'list' | 'other';
  icon: string;
  version: string;
}

/** Widget 实例 */
export interface WidgetInstance {
  id: string; // 实例ID（唯一）
  widgetId: string; // Widget类型ID（来自注册表）
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config?: Record<string, any>; // Widget 自定义配置
  visible: boolean;
}

/** Widget 组件 Props */
export interface WidgetProps {
  id: string;
  config?: Record<string, any>;
  appCode?: string;
  onConfigChange?: (config: Record<string, any>) => void;
}

/** Dashboard 布局 */
export interface DashboardLayout {
  id?: string;
  name: string;
  userId?: string;
  isDefault?: boolean;
  widgets: WidgetInstance[];
  createdAt?: Date;
  updatedAt?: Date;
}

/** 统计数据 */
export interface StatisticsData {
  metaObjectCount: number;
  fieldCount: number;
  formCount: number;
  listCount: number;
  viewCount: number;
  buttonCount: number;
  datasourceCount: number;
  growth: {
    metaObject: number;
    field: number;
    form: number;
    list: number;
    view: number;
    button: number;
    datasource: number;
  };
}

/** 趋势数据 */
export interface TrendData {
  dates: string[];
  data: {
    field: number[];
    form: number[];
    list: number[];
    view: number[];
  };
}

/** 热门对象 */
export interface HotObject {
  metaObjectCode: string;
  metaObjectName: string;
  visits: number;
}

/** 最近操作 */
export interface RecentActivity {
  id: string;
  action: string;
  targetType: string;
  targetName: string;
  metaObjectName: string;
  createdAt: Date;
}

/** 健康检查结果 */
export interface HealthCheckResult {
  disabledFields: number;
  emptyForms: number;
  viewsWithoutSearch: number;
  fieldsWithoutDatasource: number;
  emptyDatasources: number;
  issues: HealthIssue[];
}

export interface HealthIssue {
  type: 'warning' | 'error' | 'info';
  message: string;
  link?: string;
}

/** 对象概览 */
export interface ObjectOverview {
  metaObjectCode: string;
  metaObjectName: string;
  appCode: string;
  fieldCount: number;
  formCount: number;
  listCount: number;
  viewCount: number;
  updatedAt: Date;
}
