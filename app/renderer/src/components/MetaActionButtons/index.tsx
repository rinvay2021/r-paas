import React from 'react';
import { Button, Space, Tooltip, Popconfirm, Dropdown, message } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  DownOutlined,
} from '@ant-design/icons';
import type { ActionButton, ListData } from '@/api/renderer/interface';
import { ButtonEvent } from '@r-paas/meta';
import { dataApi } from '@/api/data';
import { portalBus } from '@/utils/portalBus';
import BatchUpdateModal from '@/components/BatchUpdateModal';
import ImportModal from '@/components/ImportModal';

// ── 图标 / 样式工具 ──────────────────────────────────────

function getEventIcon(event: string) {
  switch (event) {
    case ButtonEvent.Create:
      return <PlusOutlined />;
    case ButtonEvent.Update:
      return <EditOutlined />;
    case ButtonEvent.Delete:
      return <DeleteOutlined />;
    case ButtonEvent.Export:
      return <ExportOutlined />;
    case ButtonEvent.Import:
      return <ImportOutlined />;
    case ButtonEvent.BatchDelete:
      return <DeleteOutlined />;
    case ButtonEvent.BatchUpdate:
      return <EditOutlined />;
    default:
      return undefined;
  }
}

function getButtonType(event: string): 'primary' | 'default' {
  return event === ButtonEvent.Create ? 'primary' : 'default';
}

function isDanger(event: string) {
  return event === ButtonEvent.Delete || event === ButtonEvent.BatchDelete;
}

function needsConfirm(event: string) {
  return event === ButtonEvent.Delete || event === ButtonEvent.BatchDelete;
}

// ── mode props ───────────────────────────────────────────

interface ViewModeProps {
  mode: 'view';
  afterAction: () => void;
}

interface ListModeProps {
  mode: 'list';
  listData: ListData;
  selectedRows: Record<string, any>[];
  searchParams?: Array<{ fieldCode: string; condition: string; value: any }>;
  afterAction: () => void;
}

interface ListRowModeProps {
  mode: 'listRow';
  record: Record<string, any>;
  afterAction: () => void;
}

interface DetailModeProps {
  mode: 'detail';
  record: Record<string, any>;
  afterAction: () => void;
}

type ModeProps = ViewModeProps | ListModeProps | ListRowModeProps | DetailModeProps;

interface MetaActionButtonsProps {
  buttons: ActionButton[];
  variant?: 'block' | 'inline';
}

type Props = MetaActionButtonsProps & ModeProps;

// ── 组件 ─────────────────────────────────────────────────

const MetaActionButtons: React.FC<Props> = props => {
  const { buttons, variant = 'block' } = props;
  const [batchUpdateOpen, setBatchUpdateOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);

  // 每个实例唯一 id，用于区分是哪个实例触发的表单
  const instanceId = React.useRef(Math.random().toString(36).slice(2));

  // 监听 portal:formClosed，只响应自己实例触发的
  React.useEffect(() => {
    const off = portalBus.onFormClosed(({ actionId }) => {
      const registered = (window as any).__afterFormAction;
      if (registered?.actionId === actionId && registered?.instanceId === instanceId.current) {
        registered.fn?.();
      }
    });
    return off;
  }, []);

  const sorted = (buttons || []).sort((a, b) => (a.buttonOrder ?? 0) - (b.buttonOrder ?? 0));
  if (!sorted.length) return null;

  const isInline = variant === 'inline';

  // 打开表单弹窗，并注册 afterAction 供 portal 回调
  const openForm = (btn: ActionButton, recordId?: string) => {
    const appCode = btn.appCode || '';
    const metaObjectCode = btn.metaObjectCode || '';
    const formCode = btn.buttonConfig?.formCode;
    if (!formCode) return;
    const actionId = Math.random().toString(36).slice(2);
    (window as any).__afterFormAction = {
      actionId,
      instanceId: instanceId.current,
      fn: props.afterAction,
    };
    portalBus.openFormModal({ appCode, metaObjectCode, formCode, recordId, actionId });
  };

  const handleExport = async (scope: 'selected' | 'all') => {
    if (props.mode !== 'list') return;
    const { listData, selectedRows, searchParams } = props;
    const listCode = (listData as any).listCode || '';

    if (scope === 'selected' && !selectedRows.length) {
      message.warning('请先勾选要导出的记录');
      return;
    }

    try {
      const res = (await dataApi.exportData({
        appCode: listData.appCode,
        metaObjectCode: listData.metaObjectCode,
        listCode,
        scope,
        ids: scope === 'selected' ? selectedRows.map((r: any) => r._id).filter(Boolean) : undefined,
        searchParams: scope === 'all' ? searchParams : undefined,
      })) as any;

      if (res?.data?.taskId) {
        message.success('导出任务已创建，请在任务列表中查看进度');
      }
    } catch {
      // 错误提示由 http 拦截器统一处理
    }
  };

  const handleClick = async (btn: ActionButton) => {
    const event = btn.buttonEvent || '';
    const appCode = btn.appCode || '';
    const metaObjectCode = btn.metaObjectCode || '';

    if (event === ButtonEvent.Create) {
      openForm(btn);
      return;
    }

    if (event === ButtonEvent.Update) {
      const record = props.mode === 'listRow' || props.mode === 'detail' ? props.record : undefined;
      openForm(btn, record?._id);
      return;
    }

    if (event === ButtonEvent.Delete) {
      const record = props.mode === 'listRow' || props.mode === 'detail' ? props.record : undefined;
      if (!record?._id) return;
      try {
        await dataApi.delete({ appCode, metaObjectCode, id: record._id });
        message.success('删除成功');
        props.afterAction();
      } catch (err: any) {
        message.error(err?.message || '删除失败');
      }
      return;
    }

    if (event === ButtonEvent.BatchDelete && props.mode === 'list') {
      const ids = props.selectedRows.map((r: any) => r._id).filter(Boolean);
      if (!ids.length) {
        message.warning('请先勾选要删除的记录');
        return;
      }
      try {
        await dataApi.batchDelete({ appCode, metaObjectCode, ids });
        message.success(`已删除 ${ids.length} 条记录`);
        props.afterAction();
      } catch (err: any) {
        message.error(err?.message || '批量删除失败');
      }
      return;
    }

    if (event === ButtonEvent.BatchUpdate && props.mode === 'list') {
      if (!props.selectedRows.length) {
        message.warning('请先勾选要编辑的记录');
        return;
      }
      setBatchUpdateOpen(true);
      return;
    }

    if (event === ButtonEvent.Import && props.mode === 'list') {
      setImportOpen(true);
      return;
    }
  };

  const renderButton = (btn: ActionButton) => {
    const event = btn.buttonEvent || '';

    // Export 按钮：hover 展示二级菜单
    if (event === ButtonEvent.Export && props.mode === 'list') {
      return (
        <Dropdown
          key={btn.buttonCode}
          trigger={['hover']}
          menu={{
            items: [
              { key: 'selected', label: '导出选中行', onClick: () => handleExport('selected') },
              { key: 'all', label: '导出当前列表', onClick: () => handleExport('all') },
            ],
          }}
        >
          <Button icon={<ExportOutlined />} size={isInline ? 'small' : 'middle'}>
            {btn.buttonName}
            <DownOutlined style={{ fontSize: 10, marginLeft: 2 }} />
          </Button>
        </Dropdown>
      );
    }

    const icon = isInline ? undefined : getEventIcon(event);
    const type = isInline ? 'link' : getButtonType(event);
    const danger = isDanger(event);
    const confirm = needsConfirm(event);

    // BatchDelete 前置校验：未选中时直接触发（内部提示）
    const skipConfirm =
      confirm &&
      event === ButtonEvent.BatchDelete &&
      props.mode === 'list' &&
      props.selectedRows.length === 0;

    const inner = (
      <Button
        key={btn.buttonCode}
        type={type as any}
        danger={danger}
        size={isInline ? 'small' : 'middle'}
        icon={icon}
        style={isInline ? { padding: '0 4px' } : undefined}
        onClick={() => (!confirm || skipConfirm) && handleClick(btn)}
      >
        {btn.buttonName}
      </Button>
    );

    const withTooltip = btn.buttonHelpTip ? (
      <Tooltip title={btn.buttonHelpTip} key={btn.buttonCode}>
        {inner}
      </Tooltip>
    ) : (
      React.cloneElement(inner, { key: btn.buttonCode })
    );

    if (confirm && !skipConfirm) {
      return (
        <Popconfirm
          key={btn.buttonCode}
          title={`确认${btn.buttonName}吗？`}
          okText="确认"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleClick(btn)}
        >
          {withTooltip}
        </Popconfirm>
      );
    }

    return withTooltip;
  };

  return (
    <>
      <Space size="small" wrap>
        {sorted.map(renderButton)}
      </Space>

      {props.mode === 'list' && (
        <>
          <BatchUpdateModal
            open={batchUpdateOpen}
            listData={props.listData}
            selectedRows={props.selectedRows}
            onSuccess={() => {
              setBatchUpdateOpen(false);
              props.afterAction();
            }}
            onCancel={() => setBatchUpdateOpen(false)}
          />
          <ImportModal
            open={importOpen}
            listData={props.listData}
            onClose={() => setImportOpen(false)}
            onSuccess={() => {
              setImportOpen(false);
              props.afterAction();
            }}
            onAsyncTask={taskId => {
              setImportOpen(false);
              portalBus.openTaskList();
            }}
          />
        </>
      )}
    </>
  );
};

export default MetaActionButtons;
