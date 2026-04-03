import React from 'react';
import { Skeleton, Result, Button, Space, Typography, message, Form } from 'antd';
import { useRequest } from 'ahooks';
import { rendererApi } from '@/api/renderer';
import { dataApi } from '@/api/data';
import MetaForm from '@/components/MetaForm';

interface FormPageProps {
  // 当作弹窗嵌入时由 App.tsx 传入，覆盖 URL 参数
  overrideParams?: { appCode: string; metaObjectCode: string; formCode: string };
  onClose?: (submitted?: boolean) => void;
}

const FormPage: React.FC<FormPageProps> = ({ overrideParams, onClose }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const appCode = overrideParams?.appCode || urlParams.get('appCode') || '';
  const metaObjectCode = overrideParams?.metaObjectCode || urlParams.get('metaObjectCode') || '';
  const formCode = overrideParams?.formCode || urlParams.get('formCode') || '';

  const { data, loading, error } = useRequest(
    () => rendererApi.getForm({ appCode, metaObjectCode, formCode }),
    { ready: !!(appCode && metaObjectCode && formCode) },
  );

  const formData = data?.data?.form;
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);

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
      // 独立页面模式：通知父级
      try { window.parent.postMessage({ type: 'form:cancel' }, '*'); } catch {}
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
      await dataApi.create({ appCode, metaObjectCode, data: values });
      message.success('提交成功');
      if (onClose) {
        onClose(true); // true 表示提交成功，通知刷新
      } else {
        try { window.parent.postMessage({ type: 'form:submit' }, '*'); } catch {}
      }
    } catch (err: any) {
      message.error(err?.message || '提交失败');
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
          // 不设 overflow: hidden，让日期等弹窗能正常显示在卡片外
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
            {formData?.formName || '表单'}
          </Typography.Text>
        </div>

        {/* 表单内容区 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {loading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : formData ? (
            <MetaForm formData={formData} mode="create" form={form} />
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
                提交
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
