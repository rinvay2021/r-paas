import { PageType, ComponentType } from './types';

export const DETAIL_PAGE_OPTIONS = [
  {
    label: '平铺',
    value: PageType.TagTiled,
  },
  {
    label: '垂直',
    value: PageType.OnePage,
  },
];

export const COMPONENT_TYPE_OPTIONS = [
  {
    label: '列表',
    value: ComponentType.List,
  },
  {
    label: '视图',
    value: ComponentType.View,
  },
];
