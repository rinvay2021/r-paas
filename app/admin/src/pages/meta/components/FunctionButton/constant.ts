import {
  HelpType,
  ButtonLevel,
  ButtonEventType,
  ButtonEvent,
  BooleanEnum,
  ButtonConfigItem,
} from './type';

/** 帮助类型选项 */
export const HELP_TYPE_OPTIONS = [
  { label: '帮助提示', value: HelpType.TOOLTIP },
  { label: '帮助提示+链接', value: HelpType.LINK },
];

/** 按钮级别选项 */
export const BUTTON_LEVEL_OPTIONS = [
  { label: '视图', value: ButtonLevel.View },
  { label: '列表', value: ButtonLevel.List },
  { label: '列表行', value: ButtonLevel.ListRow },
  // { label: '详情页', value: ButtonLevel.DetailPage },
];

/** 事件类型选项 */
export const BUTTON_EVENT_TYPE_OPTIONS = [
  { label: '系统事件', value: ButtonEventType.System },
  { label: '自定义事件', value: ButtonEventType.Custom },
];

/** 视图事件选项 */
export const VIEW_BUTTON_EVENT_OPTIONS = [
  { label: '新建', value: ButtonEvent.Create },
  { label: '导出', value: ButtonEvent.Export },
  { label: '导入', value: ButtonEvent.Import },
];

/** 列表事件选项 */
export const LIST_BUTTON_EVENT_OPTIONS = [
  { label: '新建', value: ButtonEvent.Create },
  { label: '批量删除', value: ButtonEvent.BatchDelete },
  { label: '批量编辑', value: ButtonEvent.BatchUpdate },
  { label: '导出', value: ButtonEvent.Export },
  { label: '导入', value: ButtonEvent.Import },
];

/** 列表行事件选项 */
export const LIST_ROW_BUTTON_EVENT_OPTIONS = [
  { label: '修改', value: ButtonEvent.Update },
  { label: '删除', value: ButtonEvent.Delete },
];

/** 详情页事件选项 */
export const DETAIL_PAGE_BUTTON_EVENT_OPTIONS = [
  { label: '修改', value: ButtonEvent.Update },
  { label: '删除', value: ButtonEvent.Delete },
];

/** 布尔值选项 */
export const BOOLEAN_OPTIONS = [
  { label: '是', value: BooleanEnum.YES },
  { label: '否（默认）', value: BooleanEnum.NO },
];

// 根据级别获取事件选项
export const getButtonEventOptionsByLevel = (level: ButtonLevel) => {
  switch (level) {
    case ButtonLevel.View:
      return VIEW_BUTTON_EVENT_OPTIONS;
    case ButtonLevel.List:
      return LIST_BUTTON_EVENT_OPTIONS;
    case ButtonLevel.ListRow:
      return LIST_ROW_BUTTON_EVENT_OPTIONS;
    case ButtonLevel.DetailPage:
      return DETAIL_PAGE_BUTTON_EVENT_OPTIONS;
    default:
      return [];
  }
};

// 公共配置
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
    'x-component-props': {
      placeholder: '请输入按钮描述',
    },
  },
  {
    type: 'ProFormDigit',
    label: '排序',
    name: 'buttonOrder',
    'x-component-props': {
      placeholder: '请输入排序值',
      min: 0,
    },
  },
];

// 帮助设置配置
export const HELP_SETTINGS_CONFIGS: ButtonConfigItem[] = [
  {
    type: 'ProFormSelect',
    label: '帮助类型',
    name: 'buttonHelpType',
    'x-component-props': {
      placeholder: '请选择帮助类型',
      options: HELP_TYPE_OPTIONS,
    },
  },
  {
    type: 'ProFormText',
    label: '帮助提示',
    name: 'buttonHelpTip',
    'x-component-props': {
      placeholder: '请输入帮助提示',
    },
  },
  {
    type: 'ProFormText',
    label: '帮助链接',
    name: 'buttonHelpLink',
    'x-component-props': {
      placeholder: '请输入帮助链接（可选）',
      rules: [
        {
          pattern: /^(https?:\/\/.+)?$/,
          message: '请输入有效的 URL 链接',
        },
      ],
    },
  },
];

// 按钮级别配置
export const BUTTON_LEVEL_CONFIG: ButtonConfigItem[] = [
  {
    type: 'ProFormSelect',
    label: '按钮级别',
    name: 'buttonLevel',
    'x-component-props': {
      placeholder: '请选择按钮级别',
      options: BUTTON_LEVEL_OPTIONS,
      rules: [{ required: true, message: '请选择按钮级别' }],
    },
  },
];

// 事件类型配置
export const BUTTON_EVENT_TYPE_CONFIG: ButtonConfigItem[] = [
  {
    type: 'ProFormSelect',
    label: '事件类型',
    name: 'buttonEventType',
    'x-component-props': {
      placeholder: '请选择事件类型',
      options: BUTTON_EVENT_TYPE_OPTIONS,
      rules: [{ required: true, message: '请选择事件类型' }],
    },
  },
];

// JSON 配置
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

                if (typeof json !== 'object') {
                  return Promise.reject(new Error('请输入正确的JSON格式'));
                }
              } catch (error) {
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
