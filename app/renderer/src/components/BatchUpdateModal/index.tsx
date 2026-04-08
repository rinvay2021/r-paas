import React from 'react';
import { Modal, Form, Select, Space, Button, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ListData } from '@/api/renderer/interface';
import type { FieldInfo } from '@r-paas/meta';
import { FieldRenderer } from '@/components/FieldRenderer';
import { dataApi } from '@/api/data';

interface BatchUpdateModalProps {
  open: boolean;
  listData: ListData;
  selectedRows: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

interface FieldEntry {
  id: number;
  fieldCode: string;
}

const BatchUpdateModal: React.FC<BatchUpdateModalProps> = ({
  open,
  listData,
  selectedRows,
  onSuccess,
  onCancel,
}) => {
  const { appCode, metaObjectCode } = listData;
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);
  const [entries, setEntries] = React.useState<FieldEntry[]>([{ id: Date.now(), fieldCode: '' }]);

  // 从列表字段中提取可编辑字段
  const availableFields: FieldInfo[] = (listData.listFields || [])
    .filter(lf => lf.isVisible !== false && lf.field?.fieldCode)
    .map(lf => lf.field as FieldInfo);

  // 已选字段的 fieldCode 集合（避免重复选择同一字段）
  const selectedFieldCodes = new Set(entries.map(e => e.fieldCode).filter(Boolean));

  const handleAddEntry = () => {
    setEntries(prev => [...prev, { id: Date.now(), fieldCode: '' }]);
  };

  const handleRemoveEntry = (id: number) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      return next.length ? next : [{ id: Date.now(), fieldCode: '' }];
    });
  };

  const handleFieldSelect = (id: number, fieldCode: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, fieldCode } : e));
    // 切换字段时清空对应的值
    form.setFieldValue(String(id), undefined);
  };

  const handleOk = async () => {
    // 只处理已选字段的条目
    const filledEntries = entries.filter(e => e.fieldCode);
    if (!filledEntries.length) {
      message.warning('请至少选择一个字段');
      return;
    }

    let values: Record<string, any>;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    // 构建 data：{ fieldCode: value }
    const data: Record<string, any> = {};
    filledEntries.forEach(e => {
      const val = values[String(e.id)];
      if (val !== undefined && val !== null && val !== '') {
        data[e.fieldCode] = val;
      }
    });

    if (!Object.keys(data).length) {
      message.warning('请至少填写一个字段的值');
      return;
    }

    const ids = selectedRows.map(r => r._id).filter(Boolean);
    try {
      setSubmitting(true);
      await dataApi.batchUpdate({ appCode, metaObjectCode, ids, data });
      message.success(`已更新 ${ids.length} 条记录`);
      form.resetFields();
      setEntries([{ id: Date.now(), fieldCode: '' }]);
      onSuccess();
    } catch (err: any) {
      message.error(err?.message || '批量更新失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setEntries([{ id: Date.now(), fieldCode: '' }]);
    onCancel();
  };

  return (
    <Modal
      title={`批量编辑（已选 ${selectedRows.length} 条）`}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="确定"
      cancelText="取消"
      confirmLoading={submitting}
      width={560}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {entries.map((entry, idx) => {
          const field = availableFields.find(f => f.fieldCode === entry.fieldCode);
          return (
            <div key={entry.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
              {/* 字段选择 */}
              <Select
                style={{ width: 160, flexShrink: 0 }}
                placeholder="选择字段"
                value={entry.fieldCode || undefined}
                onChange={val => handleFieldSelect(entry.id, val)}
                options={availableFields.map(f => ({
                  label: f.fieldName,
                  value: f.fieldCode,
                  disabled: selectedFieldCodes.has(f.fieldCode) && f.fieldCode !== entry.fieldCode,
                }))}
              />

              {/* 值输入控件 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {field ? (
                  <Form.Item
                    name={String(entry.id)}
                    style={{ marginBottom: 0 }}
                  >
                    <FieldRenderer field={field} />
                  </Form.Item>
                ) : (
                  <Select disabled placeholder="请先选择字段" style={{ width: '100%' }} />
                )}
              </div>

              {/* 删除行 */}
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveEntry(entry.id)}
                style={{ flexShrink: 0 }}
              />
            </div>
          );
        })}

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAddEntry}
          style={{ width: '100%', marginTop: 4 }}
        >
          添加字段
        </Button>
      </Form>
    </Modal>
  );
};

export default BatchUpdateModal;
