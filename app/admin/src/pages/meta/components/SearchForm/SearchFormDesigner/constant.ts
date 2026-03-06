/** 条件选项 */
export const CONDITION_OPTIONS = [
  { label: '等于', value: '=' },
  { label: '不等于', value: '!=' },
  { label: '包含', value: 'like' },
  { label: '大于', value: '>' },
  { label: '大于等于', value: '>=' },
  { label: '小于', value: '<' },
  { label: '小于等于', value: '<=' },
];

export const DRAG_TYPE = 'DraggableSearchFormField';

/**
 * 1、查询条件，根据字段类型决定可选查询条件。过滤不可查询的字段类型。
 * 2、默认值选择
 */