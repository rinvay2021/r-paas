/**
 * 选择类字段值工具
 *
 * 存储格式：
 *   单选/单选框   → { label: string; value: string }
 *   多选/多选框   → [{ label: string; value: string }]
 *   Cascader     → [{ label: string; value: string }, ...]  (路径数组)
 *   TreeSelect   → { label: string; value: string } | [{ label; value }]
 *   LocationSelect → [{ label: string; value: string }, ...]
 */

export type LabelValue = { label: string; value: string };

/** 判断是否是 {label,value} 对象 */
export const isLabelValue = (v: any): v is LabelValue =>
  v !== null && typeof v === 'object' && !Array.isArray(v) && 'value' in v;

/**
 * 从存储值中提取用于后端查询的原始 value。
 * - 单个 {label,value} → value 字符串
 * - [{label,value}] 数组 → value 字符串数组（用于 in 查询）
 * - Cascader/Location 路径数组 → 最后一级 value（用于 eq 查询）
 * - 原始值 → 原样返回
 */
export function extractQueryValue(val: any, isCascader = false): any {
  if (val === null || val === undefined) return val;

  if (Array.isArray(val)) {
    if (val.length === 0) return val;
    // Cascader / LocationSelect：路径数组，取最后一级 value
    if (isCascader) {
      const last = val[val.length - 1];
      return isLabelValue(last) ? last.value : last;
    }
    // 多选：提取 value 数组
    return val.map(v => (isLabelValue(v) ? v.value : v));
  }

  if (isLabelValue(val)) return val.value;

  return val;
}

/**
 * 从存储值中提取用于展示的文本。
 * - 单个 {label,value} → label
 * - [{label,value}] → label 用 '、' 连接
 * - Cascader/Location 路径 → label 用 ' / ' 连接
 * - 原始值 → String(val)
 */
export function extractDisplayText(val: any, isCascader = false): string {
  if (val === null || val === undefined || val === '') return '—';

  if (Array.isArray(val)) {
    if (val.length === 0) return '—';
    const labels = val.map(v => (isLabelValue(v) ? v.label : String(v)));
    return labels.join(isCascader ? ' / ' : '、') || '—';
  }

  if (isLabelValue(val)) return val.label || '—';

  return String(val) || '—';
}

/**
 * 联动引擎用：从 formValues 中提取指定字段的比较值。
 * 多选返回 value 数组，单选返回 value 字符串，其他原样返回。
 */
export function extractLinkageValue(val: any): any {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) return val.map(v => (isLabelValue(v) ? v.value : v));
  if (isLabelValue(val)) return val.value;
  return val;
}
