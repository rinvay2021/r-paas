import React from 'react';
import { Button, Space, Tooltip, Popconfirm } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import type { ActionButton } from '@/api/renderer/interface';

// 与 admin FunctionButton 保持一致的枚举
const ButtonLevel = {
  View: 'View',
  List: 'List',
  ListRow: 'ListRow',
  DetailPage: 'DetailPage',
} as const;

const ButtonEvent = {
  Create: 'Create',
  Update: 'Update',
  Delete: 'Delete',
  Export: 'Export',
  Import: 'Import',
  BatchDelete: 'BatchDelete',
  BatchUpdate: 'BatchUpdate',
} as const;

/** 根据 buttonEvent 返回图标 */
function getEventIcon(event: string) {
  switch (event) {
    case ButtonEvent.Create: return <PlusOutlined />;
    case ButtonEvent.Update: return <EditOutlined />;
    case ButtonEvent.Delete: return <DeleteOutlined />;
    case ButtonEvent.Export: return <ExportOutlined />;
    case ButtonEvent.Import: return <ImportOutlined />;
    case ButtonEvent.BatchDelete: return <DeleteOutlined />;
    case ButtonEvent.BatchUpdate: return <EditOutlined />;
    default: return undefined;
  }
}

/** 根据 buttonEvent 判断是否需要二次确认 */
function needsConfirm(event: string) {
  return event === ButtonEvent.Delete || event === ButtonEvent.BatchDelete;
}

/** 根据 buttonEvent 返回按钮类型 */
function getButtonType(event: string): 'primary' | 'default' | 'dashed' | undefined {
  switch (event) {
    case ButtonEvent.Create: return 'primary';
    case ButtonEvent.Delete:
    case ButtonEvent.BatchDelete: return 'default';
    default: return 'default';
  }
}

/** 根据 buttonEvent 判断是否 danger */
function isDanger(event: string) {
  return event === ButtonEvent.Delete || event === ButtonEvent.BatchDelete;
}

interface MetaActionButtonsProps {
  buttons: ActionButton[];
  /** page = View/List 级别；row = ListRow/DetailPage 级别 */
  level?: 'page' | 'row';
  onButtonClick?: (button: ActionButton, record?: any) => void;
  record?: any;
  /** 点击需要二次确认的按钮前调用，返回 false 则跳过确认直接调 onButtonClick（用于前置校验） */
  onBeforeConfirm?: (button: ActionButton) => boolean;
}

const MetaActionButtons: React.FC<MetaActionButtonsProps> = ({
  buttons,
  level = 'page',
  onButtonClick,
  onBeforeConfirm,
  record,
}) => {
  const filtered = (buttons || [])
    .filter((btn) => {
      const lvl = btn.buttonLevel || '';
      if (level === 'page') {
        return lvl === ButtonLevel.View || lvl === ButtonLevel.List;
      }
      if (level === 'row') {
        return lvl === ButtonLevel.ListRow || lvl === ButtonLevel.DetailPage;
      }
      return true;
    })
    .sort((a, b) => (a.buttonOrder ?? 0) - (b.buttonOrder ?? 0));

  if (!filtered.length) return null;

  const renderButton = (btn: ActionButton) => {
    const event = btn.buttonEvent || '';
    const isRow = level === 'row';
    const icon = isRow ? undefined : getEventIcon(event);
    const type = isRow ? 'link' : getButtonType(event);
    const danger = isDanger(event);
    const confirm = needsConfirm(event);

    const inner = (
      <Button
        key={btn.buttonCode}
        type={type as any}
        danger={danger}
        size={isRow ? 'small' : 'middle'}
        icon={icon}
        style={isRow ? { padding: '0 4px' } : undefined}
        onClick={() => !confirm && onButtonClick?.(btn, record)}
      >
        {btn.buttonName}
      </Button>
    );

    // 帮助提示包裹
    const withTooltip = btn.buttonHelpTip ? (
      <Tooltip title={btn.buttonHelpTip} key={btn.buttonCode}>
        {inner}
      </Tooltip>
    ) : (
      React.cloneElement(inner, { key: btn.buttonCode })
    );

    // 危险操作二次确认
    if (confirm) {
      // 前置校验不通过（如未选中）：直接触发 onButtonClick 让上层处理提示，不弹 Popconfirm
      const passCheck = onBeforeConfirm ? onBeforeConfirm(btn) : true;
      if (!passCheck) {
        return React.cloneElement(withTooltip as React.ReactElement, {
          key: btn.buttonCode,
          onClick: () => onButtonClick?.(btn, record),
        });
      }

      return (
        <Popconfirm
          key={btn.buttonCode}
          title={`确认${btn.buttonName}吗？`}
          okText="确认"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={() => onButtonClick?.(btn, record)}
        >
          {withTooltip}
        </Popconfirm>
      );
    }

    return withTooltip;
  };

  return (
    <Space size="small" wrap>
      {filtered.map(renderButton)}
    </Space>
  );
};

export default MetaActionButtons;
