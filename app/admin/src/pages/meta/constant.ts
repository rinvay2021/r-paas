/** 元数据创建页面常量 */

/** 页面锚点 */
export const META_PAGE_OFFSET = 70;

/** Tab 高度 */
export const META_PAGE_TAB_HEIGHT = 54;

/** 字段列表高度 */
export const META_FIELD_LIST_HEIGHT = 160;

export enum PageType {
  Tiled = 'Tiled',
  Vertivcal = 'Vertivcal',
}

/** 详情页面类型 */
export const DETAIL_PAGE_OPTIONS = [
  {
    label: '平铺',
    value: PageType.Tiled,
  },
  {
    label: '垂直',
    value: PageType.Vertivcal,
  },
];
