/**
 * 表单联动规则类型定义
 */

/** 条件操作符（统一使用 eq/neq 格式） */
export type ConditionOperator =
  | 'eq'       // 等于
  | 'neq'      // 不等于
  | 'gt'       // 大于
  | 'lt'       // 小于
  | 'gte'      // 大于等于
  | 'lte'      // 小于等于
  | 'contains' // 包含（字符串）
  | 'empty'    // 为空
  | 'notEmpty'; // 不为空

export const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  eq: '等于',
  neq: '不等于',
  gt: '大于',
  lt: '小于',
  gte: '大于等于',
  lte: '小于等于',
  contains: '包含',
  empty: '为空',
  notEmpty: '不为空',
};

export const CONDITION_OPERATORS = [
  { label: '等于', value: 'eq' as ConditionOperator },
  { label: '不等于', value: 'neq' as ConditionOperator },
  { label: '大于', value: 'gt' as ConditionOperator },
  { label: '小于', value: 'lt' as ConditionOperator },
  { label: '大于等于', value: 'gte' as ConditionOperator },
  { label: '小于等于', value: 'lte' as ConditionOperator },
  { label: '包含', value: 'contains' as ConditionOperator },
  { label: '为空', value: 'empty' as ConditionOperator },
  { label: '不为空', value: 'notEmpty' as ConditionOperator },
] as const;

export interface LinkageCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
}

export interface LinkageActions {
  show?: string[];
  hide?: string[];
  require?: string[];
  unrequire?: string[];
  readonly?: string[];
  editable?: string[];
  clear?: string[];
}

export interface LinkageRule {
  id: string;
  condition: LinkageCondition;
  actions: LinkageActions;
}

export type LinkageSettings = LinkageRule[];
