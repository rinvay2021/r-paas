import type { ConditionOperator } from './types';

export const OPERATOR_LABELS: Record<string, string> = {
  '==': '等于',
  '!=': '不等于',
  '>': '大于',
  '<': '小于',
  '>=': '大于等于',
  '<=': '小于等于',
  'contains': '包含',
  'isEmpty': '为空',
  'isNotEmpty': '不为空',
};

export const CONDITION_OPERATORS: Array<{ label: string; value: ConditionOperator }> = [
  { label: '等于', value: '==' },
  { label: '不等于', value: '!=' },
  { label: '大于', value: '>' },
  { label: '小于', value: '<' },
  { label: '大于等于', value: '>=' },
  { label: '小于等于', value: '<=' },
  { label: '包含', value: 'contains' },
  { label: '为空', value: 'isEmpty' },
  { label: '不为空', value: 'isNotEmpty' },
];
