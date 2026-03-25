/**
 * 表单联动规则类型定义
 */

/**
 * 条件操作符
 */
export type ConditionOperator =
  | '==' // 等于
  | '!=' // 不等于
  | '>' // 大于
  | '<' // 小于
  | '>=' // 大于等于
  | '<=' // 小于等于
  | 'contains' // 包含（字符串）
  | 'isEmpty' // 为空
  | 'isNotEmpty'; // 不为空

/**
 * 条件操作符显示文本映射
 */
export const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  '==': '等于',
  '!=': '不等于',
  '>': '大于',
  '<': '小于',
  '>=': '大于等于',
  '<=': '小于等于',
  contains: '包含',
  isEmpty: '为空',
  isNotEmpty: '不为空',
};

/**
 * 条件操作符选项
 */
export const CONDITION_OPERATORS = [
  { label: '等于', value: '==' },
  { label: '不等于', value: '!=' },
  { label: '大于', value: '>' },
  { label: '小于', value: '<' },
  { label: '大于等于', value: '>=' },
  { label: '小于等于', value: '<=' },
  { label: '包含', value: 'contains' },
  { label: '为空', value: 'isEmpty' },
  { label: '不为空', value: 'isNotEmpty' },
] as const;

/**
 * 联动规则触发条件
 */
export interface LinkageCondition {
  field: string; // 字段编码
  operator: ConditionOperator; // 操作符
  value: any; // 条件值（isEmpty/isNotEmpty 不需要值）
}

/**
 * 联动规则执行动作
 */
export interface LinkageActions {
  show?: string[]; // 显示的字段列表
  hide?: string[]; // 隐藏的字段列表
  require?: string[]; // 必填的字段列表
  unrequire?: string[]; // 非必填的字段列表
  readonly?: string[]; // 只读的字段列表
  editable?: string[]; // 可编辑的字段列表
  clear?: string[]; // 清空的字段列表
}

/**
 * 联动规则
 */
export interface LinkageRule {
  id: string; // 规则ID
  condition: LinkageCondition; // 触发条件
  actions: LinkageActions; // 执行动作
}

/**
 * 联动规则配置（直接是数组）
 */
export type LinkageSettings = LinkageRule[];
