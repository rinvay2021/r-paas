import {
  FieldConfigItem,
  FieldTypeEnum,
  TextInputTypeEnum,
  BooleanEnum,
  TimePickerTypeEnum,
} from './type';

export const INPUT_TYPE_OPTIONS = [
  { label: '普通文本', value: TextInputTypeEnum.Text },
  { label: 'URL', value: TextInputTypeEnum.Url },
  { label: '电话', value: TextInputTypeEnum.Tel },
  { label: '邮箱', value: TextInputTypeEnum.Email },
  { label: '密码', value: TextInputTypeEnum.Password },
];

// 布尔值选项
export const BOOLEAN_OPTIONS = [
  { label: '是', value: BooleanEnum.YES },
  { label: '否（默认）', value: BooleanEnum.NO },
];

// 字段类型分组
export const FIELD_TYPE_GROUPS = [
  {
    label: '文本输入',
    type: FieldTypeEnum.Text,
  },
  {
    label: '数字输入',
    type: FieldTypeEnum.Text_Number,
  },
  {
    label: '多行文本',
    type: FieldTypeEnum.Textarea,
  },
  {
    label: '富文本',
    type: FieldTypeEnum.Text_Rich,
  },
  {
    label: '时间选择',
    type: FieldTypeEnum.TimePicker,
  },
  {
    label: '日期选择',
    type: FieldTypeEnum.DatePicker,
  },
  {
    label: '月份选择',
    type: FieldTypeEnum.MonthPicker,
  },
  {
    label: '年份选择',
    type: FieldTypeEnum.YearPicker,
  },
  {
    label: '单选框',
    type: FieldTypeEnum.SingleRadio,
  },
  {
    label: '复选框',
    type: FieldTypeEnum.MultipleCheckbox,
  },
  {
    label: '下拉单选',
    type: FieldTypeEnum.SingleSelect,
  },
  {
    label: '下拉多选',
    type: FieldTypeEnum.MultipleSelect,
  },
  {
    label: '树状选择',
    type: FieldTypeEnum.TreeSelect,
  },
  {
    label: '级联选择',
    type: FieldTypeEnum.Cascader,
  },
  {
    label: '地区选择',
    type: FieldTypeEnum.LocationSelect,
  },
  {
    label: '文件上传',
    type: FieldTypeEnum.FileUpload,
  },
  {
    label: '图片上传',
    type: FieldTypeEnum.ImageUpload,
  },
  {
    label: '颜色选择',
    type: FieldTypeEnum.ColorSelect,
  },
];

// 公共配置
export const useCommonConfigs = (isEdit?: boolean): FieldConfigItem[] => [
  {
    type: 'ProFormText',
    label: '字段名称',
    name: 'fieldName',
    'x-component-props': {
      placeholder: '请输入字段名称',
      rules: [{ required: true, message: '请输入字段名称' }],
    },
  },
  {
    type: 'ProFormText',
    label: '字段编码',
    name: 'fieldCode',
    'x-component-props': {
      placeholder: '请输入字段编码',
      disabled: isEdit,
      rules: [
        { required: true, message: '请输入字段编码' },
        {
          pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
          message: '英文字母开头，只能包含英文字母、数字和下划线',
        },
      ],
    },
  },
  {
    type: 'ProFormText',
    label: '字段描述',
    name: 'fieldDesc',
    'x-component-props': {
      placeholder: '请输入字段描述',
    },
  },
];

// 配置（JSON 格式，用于高级配置）
export const JSON_CONFIG: FieldConfigItem[] = [
  {
    type: 'ProFormTextArea',
    label: '高级配置（JSON）',
    tooltip: '需要符合JSON对象格式，例如：{"a":1,"b":2}。会与上方配置合并。',
    name: 'configJson',
    'x-component-props': {
      placeholder: '请输入JSON配置（可选）',
      rows: 4,
      rules: [
        {
          validator: (_, value) => {
            if (value && value.trim()) {
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

// 数据源配置
export const DATASOURCE_CONFIGS: FieldConfigItem[] = [
  {
    type: 'ProFormSelect',
    label: '数据源',
    name: ['config', 'datasourceCode'],
    'x-component-props': {
      placeholder: '请选择数据源',
    },
  },
];

// 是否多选
export const SELECT_CONFIGS: FieldConfigItem[] = [
  {
    type: 'ProFormRadio.Group',
    label: '是否多选',
    name: ['config', 'multiple'],
    'x-component-props': {
      options: BOOLEAN_OPTIONS,
    },
  },
];

// 是否展示时间
export const SHOW_TIME_CONFIGS: FieldConfigItem[] = [
  {
    type: 'ProFormRadio.Group',
    label: '是否展示时间',
    name: ['config', 'showTime'],
    'x-component-props': {
      options: BOOLEAN_OPTIONS,
    },
  },
];

export const TYPE_CONFIGS: Record<
  string,
  {
    properties: FieldConfigItem[];
  }
> = {
  [FieldTypeEnum.Text]: {
    properties: [
      {
        type: 'ProFormSelect',
        label: '文本类型',
        name: ['config', 'inputType'],
        'x-component-props': {
          placeholder: '请选择文本类型',
          options: INPUT_TYPE_OPTIONS,
        },
      },
    ],
  },
  [FieldTypeEnum.Text_Number]: {
    properties: [
      {
        type: 'ProFormDigit',
        label: '精度精度',
        tooltip: '决定数值保留几位小数',
        name: ['config', 'precision'],
        'x-component-props': {
          placeholder: '请输入精度',
        },
      },
    ],
  },
  [FieldTypeEnum.Textarea]: {
    properties: [],
  },
  [FieldTypeEnum.Text_Rich]: {
    properties: [],
  },
  [FieldTypeEnum.TimePicker]: {
    properties: [
      {
        type: 'ProFormRadio.Group',
        label: '是否启用12小时制',
        name: ['config', 'use12Hours'],
        'x-component-props': {
          options: BOOLEAN_OPTIONS,
        },
      },
      {
        type: 'ProFormSelect',
        label: '时间格式',
        name: ['config', 'format'],
        'x-component-props': {
          placeholder: '请选择时间格式',
          options: [
            { label: 'HH', value: 'HH' },
            { label: 'HH:mm', value: 'HH:mm' },
            { label: 'HH:mm:ss（默认）', value: 'HH:mm:ss' },
          ],
        },
      },
    ],
  },
  [FieldTypeEnum.DatePicker]: {
    properties: [
      ...SHOW_TIME_CONFIGS,
      {
        type: 'ProFormSelect',
        label: '时间选择类型',
        name: ['config', 'timeType'],
        'x-component-props': {
          options: [
            { label: '日期（默认）', value: TimePickerTypeEnum.Day },
            { label: '周', value: TimePickerTypeEnum.Week },
            { label: '月份', value: TimePickerTypeEnum.Month },
            { label: '季度', value: TimePickerTypeEnum.Quarter },
            { label: '年份', value: TimePickerTypeEnum.Year },
          ],
        },
      },
    ],
  },
  [FieldTypeEnum.MonthPicker]: {
    properties: [...SHOW_TIME_CONFIGS],
  },
  [FieldTypeEnum.YearPicker]: {
    properties: [...SHOW_TIME_CONFIGS],
  },
  [FieldTypeEnum.SingleRadio]: {
    properties: [...DATASOURCE_CONFIGS],
  },
  [FieldTypeEnum.MultipleCheckbox]: {
    properties: [...DATASOURCE_CONFIGS],
  },
  [FieldTypeEnum.SingleSelect]: {
    properties: [...DATASOURCE_CONFIGS],
  },
  [FieldTypeEnum.MultipleSelect]: {
    properties: [...DATASOURCE_CONFIGS],
  },
  [FieldTypeEnum.TreeSelect]: {
    properties: [...DATASOURCE_CONFIGS, ...SELECT_CONFIGS],
  },
  [FieldTypeEnum.Cascader]: {
    properties: [...DATASOURCE_CONFIGS, ...SELECT_CONFIGS],
  },
  [FieldTypeEnum.LocationSelect]: {
    properties: [],
  },
  [FieldTypeEnum.FileUpload]: {
    properties: [
      {
        type: 'ProFormRadio.Group',
        label: '是否支持多文件上传',
        name: ['config', 'multiple'],
        'x-component-props': {
          options: BOOLEAN_OPTIONS,
        },
      },
    ],
  },
  [FieldTypeEnum.ImageUpload]: {
    properties: [
      {
        type: 'ProFormRadio.Group',
        label: '是否支持多张图片上传',
        name: ['config', 'multiple'],
        'x-component-props': {
          options: BOOLEAN_OPTIONS,
        },
      },
    ],
  },
  [FieldTypeEnum.ColorSelect]: {
    properties: [],
  },
};
