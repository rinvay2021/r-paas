import type { WidgetConfig, WidgetInstance } from '../types';
import StatisticsCardsWidget from './StatisticsCardsWidget';
import RecentActivitiesWidget from './RecentActivitiesWidget';
import HotObjectsWidget from './HotObjectsWidget';
import HealthCheckWidget from './HealthCheckWidget';
import ObjectsOverviewWidget from './ObjectsOverviewWidget';

/** Widget 注册表 */
export const WIDGET_REGISTRY: Record<string, WidgetConfig> = {
  'statistics-cards': {
    id: 'statistics-cards',
    name: '统计卡片',
    description: '显示元数据对象、字段、表单等数量统计',
    component: StatisticsCardsWidget,
    defaultSize: { w: 12, h: 4, minW: 6, minH: 3 },
    category: 'statistics',
    icon: '📊',
    version: '1.0.0',
  },
  'hot-objects': {
    id: 'hot-objects',
    name: '热门对象',
    description: '显示访问最多的元数据对象',
    component: HotObjectsWidget,
    defaultSize: { w: 4, h: 6, minW: 3, minH: 4 },
    category: 'list',
    icon: '🔥',
    version: '1.0.0',
  },
  'recent-activities': {
    id: 'recent-activities',
    name: '最近操作',
    description: '显示最近的配置操作记录',
    component: RecentActivitiesWidget,
    defaultSize: { w: 6, h: 6, minW: 4, minH: 4 },
    category: 'list',
    icon: '🕒',
    version: '1.0.0',
  },
  'health-check': {
    id: 'health-check',
    name: '健康检查',
    description: '检查配置完整性和潜在问题',
    component: HealthCheckWidget,
    defaultSize: { w: 6, h: 6, minW: 4, minH: 4 },
    category: 'other',
    icon: '⚠️',
    version: '1.0.0',
  },
  'objects-overview': {
    id: 'objects-overview',
    name: '对象概览',
    description: '显示所有元数据对象的快速预览',
    component: ObjectsOverviewWidget,
    defaultSize: { w: 12, h: 8, minW: 8, minH: 6 },
    category: 'list',
    icon: '📋',
    version: '1.0.0',
  },
};

/** 默认布局配置 */
export const DEFAULT_LAYOUT: WidgetInstance[] = [
  {
    id: 'statistics-1',
    widgetId: 'statistics-cards',
    layout: { x: 0, y: 0, w: 12, h: 3 },
    visible: true,
  },
  {
    id: 'activities-1',
    widgetId: 'recent-activities',
    layout: { x: 0, y: 3, w: 6, h: 7 },
    config: { limit: 10 },
    visible: true,
  },
  {
    id: 'health-1',
    widgetId: 'health-check',
    layout: { x: 6, y: 3, w: 6, h: 7 },
    visible: true,
  },
  {
    id: 'overview-1',
    widgetId: 'objects-overview',
    layout: { x: 0, y: 10, w: 12, h: 7 },
    visible: true,
  },
];

/** 注册新 Widget */
export function registerWidget(config: WidgetConfig) {
  WIDGET_REGISTRY[config.id] = config;
}
