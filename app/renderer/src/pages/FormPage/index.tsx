import React from 'react';
import { Skeleton, Result, Button, Space, Typography, message, Form, Alert } from 'antd';
import type { FormHelpSettings, FormLayoutSettings } from '@r-paas/meta';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import { rendererApi } from '@/api/renderer';
import { dataApi } from '@/api/data';
import { datasourceApi } from '@/api/datasource';
import MetaForm from '@/components/MetaForm';
import { FieldType } from '@r-paas/meta';
import { portalBus } from '@/utils/portalBus';

const DATE_FIELD_TYPES = [FieldType.DatePicker, FieldType.MonthPicker, FieldType.YearPicker, FieldType.TimePicker];

// 需要数据源的字段类型
const DATASOURCE_FIELD_TYPES = [
  FieldType.SingleSelect, FieldType.MultipleSelect,
  FieldType.SingleRadio, FieldType.MultipleCheckbox,
  FieldType.TreeSelect, FieldType.Cascader,
];

/** 将记录数据中的日期字段按表单字段类型转换为 dayjs */
function transformRecordValues(
  record: Record<string, any>,
  containers: any[],
): Record<string, any> {
  // 构建 fieldCode -> fieldType 的映射
  const typeMap: Record<string, string> = {};
  (containers || []).forEach((container: any) => {
    (container.fields || []).forEach((field: any) => {
      if (field.fieldCode && field.fieldType) {
        typeMap[field.fieldCode] = field.fieldType;
      }
    });
  });

  const values: Record<string, any> = {};
  Object.keys(record).forEach(key => {
    if (key.startsWith('_')) return; // 跳过系统字段
    const val = record[key];
    const fieldType = typeMap[key];
    if (fieldType && DATE_FIELD_TYPES.includes(fieldType) && val) {
      values[key] = dayjs(val);
    } else {
      values[key] = val;
    }
  });
  return values;
}

interface FormPageProps {
  overrideParams?: {
    appCode: string;
    metaObjectCode: string;
    formCode: string;
    recordId?: string; // 有 recordId 时为编辑模式
  };
  onClose?: (submitted?: boolean) => void;
}

const FormPage: React.FC<FormPageProps> = ({ overrideParams, onClose }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const appCode = overrideParams?.appCode || urlParams.get('appCode') || '';
  const metaObjectCode = overrideParams?.metaObjectCode || urlParams.get('metaObjectCode') || '';
  const formCode = overrideParams?.formCode || urlParams.get('formCode') || '';
  const recordId = overrideParams?.recordId || urlParams.get('recordId') || '';
  const isEdit = !!recordId;

  // 加载表单元数据
  const { data: formMeta, loading: formLoading, error } = useRequest(
    () => rendererApi.getForm({ appCode, metaObjectCode, formCode }),
    { ready: !!(appCode && metaObjectCode && formCode) },
  );

  const formData = formMeta?.data?.form;
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);
  const [optionsMap, setOptionsMap] = React.useState<Record<string, { label: string; value: string }[]>>({});

  // formData 加载后批量请求有数据源的字段选项（一次请求）
  React.useEffect(() => {
    if (!formData || !appCode) return;
    const allFields = (formData.containers || []).flatMap((c: any) => c.fields || []);
    const datasourceCodes = [...new Set(
      allFields
        .filter((f: any) => DATASOURCE_FIELD_TYPES.includes(f.fieldType) && f.config?.datasourceCode)
        .map((f: any) => f.config.datasourceCode as string)
    )];
    if (datasourceCodes.length === 0) return;
    datasourceApi.batchOptions({ appCode, datasourceCodes }).then(res => {
      if (res?.data) setOptionsMap(res.data);
    }).catch(() => {});
  }, [formData, appCode]);

  // 编辑模式：加载记录数据
  const { data: recordData, loading: recordLoading } = useRequest(
    () => dataApi.detail({ appCode, metaObjectCode, id: recordId }),
    { ready: isEdit && !!(appCode && metaObjectCode && recordId) },
  );

  // formData 和 recordData 都就绪后，转换日期字段并预填表单
  React.useEffect(() => {
    if (!isEdit || !formData || !recordData?.data) return;
    const values = transformRecordValues(recordData.data, formData.containers || []);
    form.setFieldsValue(values);
  }, [formData, recordData]);

  const loading = formLoading || recordLoading;

  // ── 拖拽 ──────────────────────────────────────────────
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
  const dragging = React.useRef(false);
  const dragOffset = React.useRef({ x: 0, y: 0 });
  const cardRef = React.useRef<HTMLDivElement>(null);

  const onTitleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.tagName === 'BUTTON') return;
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      dragging.current = true;
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  };

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current || !cardRef.current) return;
      const cardW = cardRef.current.offsetWidth;
      const cardH = cardRef.current.offsetHeight;
      const newX = Math.min(Math.max(0, e.clientX - dragOffset.current.x), window.innerWidth - cardW);
      const newY = Math.min(Math.max(0, e.clientY - dragOffset.current.y), window.innerHeight - cardH);
      setPos({ x: newX, y: newY });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // ── 取消 / 提交 ───────────────────────────────────────
  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      portalBus.closeFormModal(false);
    }
  };

  const handleSubmit = async () => {
    let values: Record<string, any>;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    try {
      setSubmitting(true);
      if (isEdit) {
        await dataApi.update({ appCode, metaObjectCode, id: recordId, data: values });
        message.success('更新成功');
      } else {
        await dataApi.create({ appCode, metaObjectCode, data: values });
        message.success('提交成功');
      }
      if (onClose) {
        onClose(true);
      } else {
        // submitted=true 通知 portal 关闭弹窗并刷新列表
        portalBus.closeFormModal(true);
      }
    } catch (err: any) {
      message.error(err?.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div style={maskStyle}>
        <Result status="error" title="加载失败" subTitle={error.message} />
      </div>
    );
  }

  return (
    <div
      style={{
        ...maskStyle,
        display: pos ? 'block' : 'flex',
        alignItems: pos ? undefined : 'center',
        justifyContent: pos ? undefined : 'center',
      }}
    >
      <div
        ref={cardRef}
        style={{
          position: pos ? 'absolute' : 'relative',
          left: pos?.x,
          top: pos?.y,
          width: 720,
          maxHeight: '80vh',
          background: '#fff',
          borderRadius: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 标题栏 */}
        <div
          onMouseDown={onTitleMouseDown}
          style={{
            padding: '12px 20px',
            background: '#1a1a1a',
            color: '#fff',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            userSelect: 'none',
            flexShrink: 0,
          }}
        >
          <Typography.Text style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>
            {(() => {
              const layoutTitle = (formData?.formConfig?.layoutSettings as FormLayoutSettings)?.title;
              const formName = formData?.formName || '表单';
              const displayName = layoutTitle || formName;
              return isEdit ? `编辑 - ${displayName}` : displayName;
            })()}
          </Typography.Text>
        </div>

        {/* 表单内容区 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {loading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : formData ? (
            <>
              {/* 帮助设置 Alert */}
              {(() => {
                const h = formData.formConfig?.helpSettings as FormHelpSettings | undefined;
                if (!h) return null;
                const { type = 'info', tipType = [], tooltip, linkUrl, linkText } = h;
                const showTooltip = tipType.includes('tooltip') && tooltip;
                const showLink = tipType.includes('link') && linkUrl;
                if (!showTooltip && !showLink) return null;
                const content = (
                  <span>
                    {showTooltip && <span>{tooltip}</span>}
                    {showTooltip && showLink && <span style={{ margin: '0 6px' }}>·</span>}
                    {showLink && (
                      <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                        {linkText || '查看帮助'}
                      </a>
                    )}
                  </span>
                );
                return (
                  <Alert
                    type={type}
                    showIcon
                    message={content}
                    style={{ marginBottom: 16 }}
                  />
                );
              })()}
              <MetaForm formData={formData} mode={isEdit ? 'edit' : 'create'} form={form} optionsMap={optionsMap} />
            </>
          ) : null}
        </div>

        {/* 底部操作栏 */}
        {!loading && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'flex-end',
              flexShrink: 0,
              background: '#fff',
            }}
          >
            <Space>
              <Button onClick={handleCancel}>取消</Button>
              <Button
                type="primary"
                loading={submitting}
                onClick={handleSubmit}
                style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
              >
                {isEdit ? '保存' : '提交'}
              </Button>
            </Space>
          </div>
        )}
      </div>
    </div>
  );
};

const maskStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  overflow: 'hidden',
};

export default FormPage;
