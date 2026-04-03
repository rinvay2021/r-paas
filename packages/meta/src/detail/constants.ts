import { DetailPageType, DetailComponentType } from './types';

export const DETAIL_PAGE_OPTIONS = [
  { label: '标签平铺', value: DetailPageType.TagTiled },
  { label: '垂直展示', value: DetailPageType.OnePage },
];

export const COMPONENT_TYPE_OPTIONS = [
  { label: '列表', value: DetailComponentType.List },
  { label: '视图', value: DetailComponentType.View },
];
