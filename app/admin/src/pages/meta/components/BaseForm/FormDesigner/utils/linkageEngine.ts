/**
 * 表单联动规则引擎
 * 用于在表单运行时应用联动规则
 */

import type { LinkageRule, LinkageCondition, ConditionOperator } from '../types/linkage';

/**
 * 字段状态
 */
export interface FieldState {
  visible: boolean; // 是否可见
  required: boolean; // 是否必填
  readonly: boolean; // 是否只读
  value: any; // 字段值
}

/**
 * 表单状态
 */
export type FormState = Record<string, FieldState>;

/**
 * 联动结果
 */
export interface LinkageResult {
  fieldsToShow: Set<string>; // 需要显示的字段
  fieldsToHide: Set<string>; // 需要隐藏的字段
  fieldsToRequire: Set<string>; // 需要必填的字段
  fieldsToUnrequire: Set<string>; // 需要非必填的字段
  fieldsToReadonly: Set<string>; // 需要只读的字段
  fieldsToEditable: Set<string>; // 需要可编辑的字段
  fieldsToClear: Set<string>; // 需要清空的字段
}

/**
 * 检查条件是否满足
 */
function checkCondition(condition: LinkageCondition, formValues: Record<string, any>): boolean {
  const { field, operator, value: conditionValue } = condition;
  const fieldValue = formValues[field];

  switch (operator) {
    case 'eq':
      return fieldValue == conditionValue;
    case 'neq':
      return fieldValue != conditionValue;
    case 'gt':
      return Number(fieldValue) > Number(conditionValue);
    case 'lt':
      return Number(fieldValue) < Number(conditionValue);
    case 'gte':
      return Number(fieldValue) >= Number(conditionValue);
    case 'lte':
      return Number(fieldValue) <= Number(conditionValue);
    case 'contains':
      return String(fieldValue).includes(String(conditionValue));
    case 'empty':
      return fieldValue === undefined || fieldValue === null || fieldValue === '';
    case 'notEmpty':
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
    default:
      return false;
  }
}

/**
 * 计算联动结果
 * @param rules 联动规则列表
 * @param formValues 当前表单值
 * @returns 联动结果
 */
export function calculateLinkage(
  rules: LinkageRule[],
  formValues: Record<string, any>
): LinkageResult {
  const result: LinkageResult = {
    fieldsToShow: new Set(),
    fieldsToHide: new Set(),
    fieldsToRequire: new Set(),
    fieldsToUnrequire: new Set(),
    fieldsToReadonly: new Set(),
    fieldsToEditable: new Set(),
    fieldsToClear: new Set(),
  };

  // 遍历所有规则
  rules.forEach(rule => {
    const conditionMet = checkCondition(rule.condition, formValues);

    // 如果条件满足，执行动作
    if (conditionMet) {
      // 显示字段
      rule.actions.show?.forEach(field => result.fieldsToShow.add(field));
      // 隐藏字段
      rule.actions.hide?.forEach(field => result.fieldsToHide.add(field));
      // 必填字段
      rule.actions.require?.forEach(field => result.fieldsToRequire.add(field));
      // 非必填字段
      rule.actions.unrequire?.forEach(field => result.fieldsToUnrequire.add(field));
      // 只读字段
      rule.actions.readonly?.forEach(field => result.fieldsToReadonly.add(field));
      // 可编辑字段
      rule.actions.editable?.forEach(field => result.fieldsToEditable.add(field));
      // 清空字段
      rule.actions.clear?.forEach(field => result.fieldsToClear.add(field));
    } else {
      // 如果条件不满足，执行反向动作（自动恢复）
      // 显示 -> 隐藏
      rule.actions.show?.forEach(field => result.fieldsToHide.add(field));
      // 隐藏 -> 显示
      rule.actions.hide?.forEach(field => result.fieldsToShow.add(field));
      // 必填 -> 非必填
      rule.actions.require?.forEach(field => result.fieldsToUnrequire.add(field));
      // 非必填 -> 必填
      rule.actions.unrequire?.forEach(field => result.fieldsToRequire.add(field));
      // 只读 -> 可编辑
      rule.actions.readonly?.forEach(field => result.fieldsToEditable.add(field));
      // 可编辑 -> 只读
      rule.actions.editable?.forEach(field => result.fieldsToReadonly.add(field));
    }
  });

  return result;
}

/**
 * 应用联动结果到表单状态
 * @param result 联动结果
 * @param currentState 当前表单状态
 * @returns 新的表单状态
 */
export function applyLinkageResult(
  result: LinkageResult,
  currentState: FormState
): FormState {
  const newState = { ...currentState };

  // 处理冲突：隐藏优先、必填优先、只读优先
  Object.keys(newState).forEach(fieldCode => {
    const state = { ...newState[fieldCode] };

    // 显隐处理（隐藏优先）
    if (result.fieldsToHide.has(fieldCode)) {
      state.visible = false;
    } else if (result.fieldsToShow.has(fieldCode)) {
      state.visible = true;
    }

    // 必填处理（必填优先）
    if (result.fieldsToRequire.has(fieldCode)) {
      state.required = true;
    } else if (result.fieldsToUnrequire.has(fieldCode)) {
      state.required = false;
    }

    // 只读处理（只读优先）
    if (result.fieldsToReadonly.has(fieldCode)) {
      state.readonly = true;
    } else if (result.fieldsToEditable.has(fieldCode)) {
      state.readonly = false;
    }

    // 清空值
    if (result.fieldsToClear.has(fieldCode)) {
      state.value = undefined;
    }

    newState[fieldCode] = state;
  });

  return newState;
}

/**
 * 执行联动规则
 * @param rules 联动规则列表（可能是数组或包含 rules 的对象）
 * @param formValues 当前表单值
 * @param currentState 当前表单状态
 * @returns 新的表单状态和需要清空的字段
 */
export function executeLinkage(
  rules: LinkageRule[] | { rules: LinkageRule[] } | undefined,
  formValues: Record<string, any>,
  currentState: FormState
): { newState: FormState; fieldsToClear: string[] } {
  // 兼容新旧数据结构
  const rulesList = Array.isArray(rules) ? rules : (rules?.rules || []);

  const result = calculateLinkage(rulesList, formValues);
  const newState = applyLinkageResult(result, currentState);
  const fieldsToClear = Array.from(result.fieldsToClear);

  return { newState, fieldsToClear };
}
