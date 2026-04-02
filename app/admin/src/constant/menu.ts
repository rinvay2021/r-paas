import type { ProSettings } from '@ant-design/pro-components';

/**
 * 子菜单类型
 */
export const SUB_MENU_TYPES = [
  {
    name: '对象配置',
    route: 'meta',
  },
  {
    name: '菜单配置',
    route: 'menu',
  },
  {
    name: '数据源配置',
    route: 'datasource',
  },
];

export const LAYOUT_SETTING: ProSettings = {
  layout: 'mix',
  contentWidth: 'Fluid',
};

export const TITLE = 'R-PaaS';

export const LOGO =
  'https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*1NHAQYduQiQAAAAAAAAAAABkARQnAQ';

export const prefix = 'rpaas';
