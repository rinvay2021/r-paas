import { ButtonLevel, ButtonEventType, ButtonEvent } from './types';

export const BUTTON_LEVEL_OPTIONS = [
  { label: '视图', value: ButtonLevel.View },
  { label: '列表', value: ButtonLevel.List },
  { label: '列表行', value: ButtonLevel.ListRow },
];

export const BUTTON_EVENT_TYPE_OPTIONS = [
  { label: '系统事件', value: ButtonEventType.System },
  { label: '自定义事件', value: ButtonEventType.Custom },
];

export const VIEW_BUTTON_EVENT_OPTIONS = [
  { label: '新建', value: ButtonEvent.Create },
  { label: '导出', value: ButtonEvent.Export },
  { label: '导入', value: ButtonEvent.Import },
];

export const LIST_BUTTON_EVENT_OPTIONS = [
  { label: '新建', value: ButtonEvent.Create },
  { label: '批量删除', value: ButtonEvent.BatchDelete },
  { label: '批量编辑', value: ButtonEvent.BatchUpdate },
  { label: '导出', value: ButtonEvent.Export },
  { label: '导入', value: ButtonEvent.Import },
];

export const LIST_ROW_BUTTON_EVENT_OPTIONS = [
  { label: '修改', value: ButtonEvent.Update },
  { label: '删除', value: ButtonEvent.Delete },
];

export const DETAIL_PAGE_BUTTON_EVENT_OPTIONS = [
  { label: '修改', value: ButtonEvent.Update },
  { label: '删除', value: ButtonEvent.Delete },
];

/** 根据级别获取事件选项 */
export function getButtonEventOptionsByLevel(level: ButtonLevel) {
  switch (level) {
    case ButtonLevel.View: return VIEW_BUTTON_EVENT_OPTIONS;
    case ButtonLevel.List: return LIST_BUTTON_EVENT_OPTIONS;
    case ButtonLevel.ListRow: return LIST_ROW_BUTTON_EVENT_OPTIONS;
    case ButtonLevel.DetailPage: return DETAIL_PAGE_BUTTON_EVENT_OPTIONS;
    default: return [];
  }
}
