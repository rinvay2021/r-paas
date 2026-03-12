/** 详情页面类型 */
export enum PageType {
  TagTiled = 'TagTiled',
  OnePage = 'OnePage',
}

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
    value: 'List',
  },
  {
    label: '视图',
    value: 'View',
  },
];