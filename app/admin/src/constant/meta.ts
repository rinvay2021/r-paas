// 基础字段 - 基础表单 - 基础列表 - 搜索表单 - 功能按钮 - 基础视图
export enum META_CONFIG {
  BaseField = 'BaseField',
  BaseForm = 'BaseForm',
  BaseList = 'BaseList',
  SearchForm = 'SearchForm',
  FunctionButton = 'FunctionButton',
  BaseView = 'BaseView',
}

/**
 * 可配置类型
 *
 */
export const META_CONFIG_TYPE = [
  {
    label: '基础字段',
    value: META_CONFIG.BaseField,
  },
  {
    label: '基础表单',
    value: META_CONFIG.BaseForm,
  },
  {
    label: '基础列表',
    value: META_CONFIG.BaseList,
  },
  {
    label: '搜索表单',
    value: META_CONFIG.SearchForm,
  },
  {
    label: '功能按钮',
    value: META_CONFIG.FunctionButton,
  },
  {
    label: '基础视图',
    value: META_CONFIG.BaseView,
  },
];
