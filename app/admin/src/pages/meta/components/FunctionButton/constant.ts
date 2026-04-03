// 从 @r-paas/meta re-export，保持现有引用路径不变
export {
  BUTTON_LEVEL_OPTIONS,
  BUTTON_EVENT_TYPE_OPTIONS,
  VIEW_BUTTON_EVENT_OPTIONS,
  LIST_BUTTON_EVENT_OPTIONS,
  LIST_ROW_BUTTON_EVENT_OPTIONS,
  DETAIL_PAGE_BUTTON_EVENT_OPTIONS,
  getButtonEventOptionsByLevel,
  HELP_TYPE_OPTIONS,
  BOOLEAN_OPTIONS,
} from '@r-paas/meta';

// admin 私有配置（依赖 antd Rule 类型，不适合放 meta 包）
import type { ButtonConfigItem } from './type';
import { HelpType } from '@r-paas/meta';

export const useCommonConfigs = (isEdit?: boolean): ButtonConfigItem[] => [
  {
    type: 'ProFormText',
    label: '按钮名称',
    name: 'buttonName',
    'x-component-props': {
      placeholder: '请输入按钮名称',
      rules: [{ required: true, message: '请输入按钮名称' }],
    },
  },
  {
    type: 'ProFormText',
    label: '按钮编码',
    name: 'buttonCode',
    'x-component-props': {
      placeholder: '请输入按钮编码',
      disabled: isEdit,
      rules: [
        { required: true, message: '请输入按钮编码' },
        {
          pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
          message: '英文字母开头，只能包含英文字母、数字和下划线',
        },
      ],
    },
  },
  {
    type: 'ProFormTextArea',
    label: '按钮描述',
    name: 'buttonDesc',
    'x-component-props': { placeholder: '请输入按钮描述' },
  },
  {
    type: 'ProFormDigit',
    label: '排序',
    name: 'buttonOrder',
    'x-component-props': { placeholder: '请输入排序值', min: 0 },
  },
];

export const HELP_SETTINGS_CONFIGS: ButtonConfigItem[] = [
  {
    type: 'ProFormSelect',
    label: '帮助类型',
    name: 'buttonHelpType',
    'x-component-props': {
      placeholder: '请选择帮助类型',
      options: [
        { label: '帮助提示', value: HelpType.TOOLTIP },
        { label: '帮助提示+链接', value: HelpType.LINK },
      ],
    },
  },
  {
    type: 'ProFormText',
    label: '帮助提示',
    name: 'buttonHelpTip',
    'x-component-props': { placeholder: '请输入帮助提示' },
  },
  {
    type: 'ProFormText',
    label: '帮助链接',
    name: 'buttonHelpLink',
    'x-component-props': {
      placeholder: '请输入帮助链接（可选）',
      rules: [{ pattern: /^(https?:\/\/.+)?$/, message: '请输入有效的 URL 链接' }],
    },
  },
];

export const BUTTON_LEVEL_CONFIG: ButtonConfigItem[] = [
  {
    type: 'ProFormSelect',
    label: '按钮级别',
    name: 'buttonLevel',
    'x-component-props': {
      placeholder: '请选择按钮级别',
      options: [
        { label: '视图', value: 'View' },
        { label: '列表', value: 'List' },
        { label: '列表行', value: 'ListRow' },
      ],
      rules: [{ required: true, message: '请选择按钮级别' }],
    },
  },
];

export const BUTTON_EVENT_TYPE_CONFIG: ButtonConfigItem[] = [
  {
    type: 'ProFormSelect',
    label: '事件类型',
    name: 'buttonEventType',
    'x-component-props': {
      placeholder: '请选择事件类型',
      options: [
        { label: '系统事件', value: 'System' },
        { label: '自定义事件', value: 'Custom' },
      ],
      rules: [{ required: true, message: '请选择事件类型' }],
    },
  },
];

export const JSON_CONFIG: ButtonConfigItem[] = [
  {
    type: 'ProFormTextArea',
    label: '扩展配置',
    tooltip: '需要符合JSON对象格式，例如：{"a":1,"b":2}',
    name: 'buttonConfig',
    'x-component-props': {
      placeholder: '请输入JSON配置（可选）',
      rules: [
        {
          validator: (_, value) => {
            if (value) {
              try {
                const json = JSON.parse(value);
                if (typeof json !== 'object') return Promise.reject(new Error('请输入正确的JSON格式'));
              } catch {
                return Promise.reject(new Error('请输入正确的JSON格式'));
              }
            }
            return Promise.resolve();
          },
        },
      ],
    },
  },
];
