import React from 'react';
import { Form, Row, Col, Typography, Divider } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import type { FormData, LinkageSetting, ContainerField } from '@/api/renderer/interface';
import { FormFieldItem } from '@/components/FieldRenderer';

export interface MetaFormRef {
  validateFields: () => Promise<Record<string, any>>;
  resetFields: () => void;
}

interface MetaFormProps {
  formData: FormData;
  mode?: 'create' | 'edit' | 'view';
  initialValues?: Record<string, any>;
  onValuesChange?: (values: Record<string, any>) => void;
  form?: any;
}

/** 联动规则引擎 */
function applyLinkage(
  linkageSettings: LinkageSetting[] = [],
  values: Record<string, any>,
): {
  hidden: Set<string>;
  required: Set<string>;
  readonly: Set<string>;
} {
  const hidden = new Set<string>();
  const required = new Set<string>();
  const readonly = new Set<string>();

  linkageSettings.forEach((rule) => {
    const { condition, actions } = rule;
    const fieldVal = values[condition.field];
    let matched = false;

    switch (condition.operator) {
      case 'eq': matched = fieldVal === condition.value; break;
      case 'neq': matched = fieldVal !== condition.value; break;
      case 'gt': matched = fieldVal > condition.value; break;
      case 'lt': matched = fieldVal < condition.value; break;
      case 'contains': matched = String(fieldVal || '').includes(condition.value); break;
      case 'empty': matched = !fieldVal; break;
      case 'notEmpty': matched = !!fieldVal; break;
      default: matched = false;
    }

    if (matched) {
      actions.hide?.forEach((f) => hidden.add(f));
      actions.show?.forEach((f) => hidden.delete(f));
      actions.require?.forEach((f) => required.add(f));
      actions.unrequire?.forEach((f) => required.delete(f));
      actions.readonly?.forEach((f) => readonly.add(f));
      actions.editable?.forEach((f) => readonly.delete(f));
    }
  });

  return { hidden, required, readonly };
}

const MetaForm = React.forwardRef<MetaFormRef, MetaFormProps>(({
  formData,
  mode = 'create',
  initialValues,
  onValuesChange,
  form: externalForm,
}, ref) => {
  const [_form] = Form.useForm();
  const form = externalForm ?? _form;

  React.useImperativeHandle(ref, () => ({
    validateFields: () => form.validateFields(),
    resetFields: () => form.resetFields(),
  }), [form]);
  const [formValues, setFormValues] = React.useState<Record<string, any>>(initialValues || {});

  const linkageSettings = formData.formConfig?.linkageSettings || [];
  const { hidden, required, readonly } = applyLinkage(linkageSettings, formValues);

  const globalColumns = formData.formConfig?.layoutSettings?.columns || 2;
  const layout = formData.formConfig?.layoutSettings?.layout || 'horizontal';
  const isView = mode === 'view';

  const handleValuesChange = (_: any, allValues: Record<string, any>) => {
    setFormValues(allValues);
    onValuesChange?.(allValues);
  };

  const containers = formData.containers || [];

  return (
    <Form
      form={form}
      layout={layout}
      initialValues={initialValues}
      onValuesChange={handleValuesChange}
      labelCol={layout === 'horizontal' ? { span: 6 } : undefined}
      wrapperCol={layout === 'horizontal' ? { span: 18 } : undefined}
    >
      {containers.map((container, containerIdx) => {
        if (container.isHidden) return null;
        const cols = container.columns || globalColumns;
        const colSpan = Math.floor(24 / cols);

        const visibleFields = (container.fields || []).filter(
          (field: ContainerField) => !hidden.has(field.fieldCode),
        );

        return (
          <div key={container.id} style={{ marginBottom: containerIdx < containers.length - 1 ? 20 : 0 }}>
            {/* 分组标题：icon + title */}
            {container.title && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <AppstoreOutlined style={{ color: '#1a1a1a', fontSize: 14 }} />
                <Typography.Text strong style={{ fontSize: 14, color: '#1a1a1a' }}>
                  {container.title}
                </Typography.Text>
              </div>
            )}

            {/* 字段网格 */}
            <Row gutter={[16, 0]}>
              {visibleFields.map((field: ContainerField) => {
                const isRequired = field.required || required.has(field.fieldCode);
                const isReadonly = isView || readonly.has(field.fieldCode);

                return (
                  <Col key={field.fieldCode} span={colSpan}>
                    <FormFieldItem
                      field={{ ...field, required: isRequired, isHidden: false }}
                      disabled={isReadonly}
                    />
                  </Col>
                );
              })}
            </Row>

            {/* 分组间分隔线（非最后一组） */}
            {containerIdx < containers.length - 1 && (
              <Divider style={{ margin: '16px 0 0' }} />
            )}
          </div>
        );
      })}
    </Form>
  );
});

export default MetaForm;
