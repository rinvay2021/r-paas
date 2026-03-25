/**
 * 表单联动 Hook
 * 用于在表单中应用联动规则
 */

import { useEffect, useMemo, useState } from 'react';
import type { FormInstance } from 'antd';
import type { LinkageRule } from '../types/linkage';
import { executeLinkage, type FieldState, type FormState } from '../utils/linkageEngine';

interface UseLinkageOptions {
  rules?: LinkageRule[] | { rules: LinkageRule[] }; // 联动规则（兼容新旧格式）
  form: FormInstance; // 表单实例
  fields: string[]; // 所有字段编码列表
}

interface UseLinkageResult {
  fieldStates: FormState; // 字段状态
  isFieldVisible: (fieldCode: string) => boolean; // 判断字段是否可见
  isFieldRequired: (fieldCode: string) => boolean; // 判断字段是否必填
  isFieldReadonly: (fieldCode: string) => boolean; // 判断字段是否只读
}

/**
 * 使用联动规则
 */
export function useLinkage(options: UseLinkageOptions): UseLinkageResult {
  const { rules = [], form, fields } = options;

  // 初始化字段状态
  const initialState = useMemo<FormState>(() => {
    const state: FormState = {};
    fields.forEach(fieldCode => {
      state[fieldCode] = {
        visible: true,
        required: false,
        readonly: false,
        value: undefined,
      };
    });
    return state;
  }, [fields]);

  const [fieldStates, setFieldStates] = useState<FormState>(initialState);

  // 监听表单值变化，应用联动规则
  useEffect(() => {
    // 兼容新旧数据结构
    const rulesList = Array.isArray(rules) ? rules : (rules?.rules || []);

    if (!rulesList || rulesList.length === 0) {
      return;
    }

    // 获取表单值变化的订阅
    const unsubscribe = form.getInternalHooks('RC_FORM_INTERNAL_HOOKS').registerWatch?.((values) => {
      const formValues = form.getFieldsValue();

      // 执行联动规则
      const { newState, fieldsToClear } = executeLinkage(rulesList, formValues, fieldStates);

      // 更新字段状态
      setFieldStates(newState);

      // 清空需要清空的字段
      if (fieldsToClear.length > 0) {
        const clearValues: Record<string, any> = {};
        fieldsToClear.forEach(fieldCode => {
          clearValues[fieldCode] = undefined;
        });
        form.setFieldsValue(clearValues);
      }
    });

    // 初始执行一次
    const formValues = form.getFieldsValue();
    const { newState, fieldsToClear } = executeLinkage(rulesList, formValues, fieldStates);
    setFieldStates(newState);

    if (fieldsToClear.length > 0) {
      const clearValues: Record<string, any> = {};
      fieldsToClear.forEach(fieldCode => {
        clearValues[fieldCode] = undefined;
      });
      form.setFieldsValue(clearValues);
    }

    return () => {
      unsubscribe?.();
    };
  }, [rules, form]);

  // 辅助函数
  const isFieldVisible = (fieldCode: string) => {
    return fieldStates[fieldCode]?.visible !== false;
  };

  const isFieldRequired = (fieldCode: string) => {
    return fieldStates[fieldCode]?.required === true;
  };

  const isFieldReadonly = (fieldCode: string) => {
    return fieldStates[fieldCode]?.readonly === true;
  };

  return {
    fieldStates,
    isFieldVisible,
    isFieldRequired,
    isFieldReadonly,
  };
}
