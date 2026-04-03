import { FieldTypeEnum } from '@/pages/meta/components/BaseField/type';

// 从 @r-paas/meta re-export，保持现有引用路径不变
export {
  SqlConditionOperator,
  isRangeCondition,
  isMultipleCondition,
} from '@r-paas/meta';
export type { SqlConditionOption } from '@r-paas/meta';

import { SqlConditionOperator } from '@r-paas/meta';
import type { SqlConditionOption } from '@r-paas/meta';

export const UNSEARCHABLE_FIELD_TYPES = [
  FieldTypeEnum.FileUpload,
  FieldTypeEnum.ImageUpload,
  FieldTypeEnum.Text_Rich,
];

export function isFieldSearchable(fieldType: FieldTypeEnum): boolean {
  return !UNSEARCHABLE_FIELD_TYPES.includes(fieldType);
}

export function getSqlConditionsByFieldType(fieldType: FieldTypeEnum): SqlConditionOption[] {
  if (fieldType === FieldTypeEnum.Text || fieldType === FieldTypeEnum.Textarea) {
    return [
      { label: '等于', value: SqlConditionOperator.EQUAL },
      { label: '包含', value: SqlConditionOperator.LIKE },
    ];
  }
  if (fieldType === FieldTypeEnum.Text_Number) {
    return [
      { label: '等于', value: SqlConditionOperator.EQUAL },
      { label: '范围', value: SqlConditionOperator.BETWEEN },
    ];
  }
  if (
    fieldType === FieldTypeEnum.DatePicker ||
    fieldType === FieldTypeEnum.MonthPicker ||
    fieldType === FieldTypeEnum.YearPicker ||
    fieldType === FieldTypeEnum.TimePicker
  ) {
    return [
      { label: '等于', value: SqlConditionOperator.EQUAL },
      { label: '范围', value: SqlConditionOperator.BETWEEN },
    ];
  }
  return [{ label: '等于', value: SqlConditionOperator.EQUAL }];
}
