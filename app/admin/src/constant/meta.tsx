import {
  DatabaseOutlined,
  FormOutlined,
  ProfileOutlined,
  TableOutlined,
  SearchOutlined,
  FunctionOutlined,
  LayoutOutlined,
} from '@ant-design/icons';

// 基础字段 - 基础表单 - 基础列表 - 搜索表单 - 功能按钮 - 基础视图
export enum META_CONFIG {
  BaseField = 'BaseField',
  BaseForm = 'BaseForm',
  BaseDetail = 'BaseDetail',
  BaseList = 'BaseList',
  SearchForm = 'SearchForm',
  FunctionButton = 'FunctionButton',
  BaseView = 'BaseView',
}

/**
 * 可配置类型
 */
export const META_CONFIG_TYPE = [
  {
    label: '基础字段',
    value: META_CONFIG.BaseField,
    icon: <DatabaseOutlined />,
  },
  {
    label: '基础表单',
    value: META_CONFIG.BaseForm,
    icon: <FormOutlined />,
  },
  {
    label: '基础详情页',
    value: META_CONFIG.BaseDetail,
    icon: <ProfileOutlined />,
  },
  {
    label: '基础列表',
    value: META_CONFIG.BaseList,
    icon: <TableOutlined />,
  },
  {
    label: '搜索表单',
    value: META_CONFIG.SearchForm,
    icon: <SearchOutlined />,
  },
  {
    label: '功能按钮',
    value: META_CONFIG.FunctionButton,
    icon: <FunctionOutlined />,
  },
  {
    label: '基础视图',
    value: META_CONFIG.BaseView,
    icon: <LayoutOutlined />,
  },
];
