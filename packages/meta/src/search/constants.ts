/** SQL 查询条件操作符 */
export enum SqlConditionOperator {
  EQUAL = 'eq',
  NOT_EQUAL = 'neq',
  LIKE = 'like',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  BETWEEN = 'between',
  IN = 'in',
  NOT_IN = 'not_in',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
}

export function isRangeCondition(condition: SqlConditionOperator): boolean {
  return condition === SqlConditionOperator.BETWEEN;
}

export function isMultipleCondition(condition: SqlConditionOperator): boolean {
  return [SqlConditionOperator.IN, SqlConditionOperator.NOT_IN].includes(condition);
}
