/** SQL 查询条件操作符 */
export enum SqlConditionOperator {
  EQUAL = '=',
  NOT_EQUAL = '!=',
  LIKE = 'like',
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<=',
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
