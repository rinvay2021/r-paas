import React from 'react';
import { Form, Row, Col, Typography, Divider } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import type {
  FormData,
  LinkageSetting,
  ContainerField,
  FormContainer,
  ContainerMode,
  FormLayoutSettings,
} from '@r-paas/meta';
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
  optionsMap?: Record<string, { label: string; value: string }[]>;
}

// ── 联动规则引擎（统一使用 eq/neq/gt/lt/gte/lte/contains/empty/notEmpty）
function applyLinkage(
  linkageSettings: LinkageSetting[] = [],
  values: Record<string, any>,
) {
  const hidden = new Set<string>();
  const required = new Set<string>();
  const readonly = new Set<string>();
  const cleared = new Set<string>();

  linkageSettings.forEach((rule) => {
    const { condition, actions } = rule;
    const fieldVal = values[condition.field];
    let matched = false;

    switch (condition.operator) {
      case 'eq': matched = fieldVal == condition.value; break;
      case 'neq': matched = fieldVal != condition.value; break;
      case 'gt': matched = Number(fieldVal) > Number(condition.value); break;
      case 'lt': matched = Number(fieldVal) < Number(condition.value); break;
      case 'gte': matched = Number(fieldVal) >= Number(condition.value); break;
      case 'lte': matched = Number(fieldVal) <= Number(condition.value); break;
      case 'contains': matched = String(fieldVal || '').includes(String(condition.value)); break;
      case 'empty': matched = fieldVal === undefined || fieldVal === null || fieldVal === ''; break;
      case 'notEmpty': matched = fieldVal !== undefined && fieldVal !== null && fieldVal !== ''; break;
      default: matched = false;
    }

    if (matched) {
      actions.hide?.forEach(f => hidden.add(f));
      actions.show?.forEach(f => hidden.delete(f));
      actions.require?.forEach(f => required.add(f));
      actions.unrequire?.forEach(f => required.delete(f));
      actions.readonly?.forEach(f => readonly.add(f));
      actions.editable?.forEach(f => readonly.delete(f));
      actions.clear?.forEach(f => cleared.add(f));
    }
  });

  return { hidden, required, readonly, cleared };
}

function getModeConfig(
  mode: 'create' | 'edit' | 'view',
  createMode?: ContainerMode,
  editMode?: ContainerMode,
  viewMode?: ContainerMode,
): ContainerMode | undefined {
  if (mode === 'create') return createMode;
  if (mode === 'edit') return editMode;
  return viewMode;
}


const MetaForm = React.forwardRef<MetaFormRef, MetaFormProps>(({
  formData,
  mode = 'create',
  initialValues,
  onValuesChange,
  form: externalForm,
  optionsMap,
}, ref) => {
  const [_form] = Form.useForm();
  const form = externalForm ?? _form;

  React.useImperativeHandle(ref, () => ({
    validateFields: () => form.validateFields(),
    resetFields: () => form.resetFields(),
  }), [form]);

  const [formValues, setFormValues] = React.useState<Record<string, any>>(initialValues || {});

  const linkageSettings = formData.formConfig?.linkageSettings || [];
  const { hidden, required, readonly, cleared } = applyLinkage(linkageSettings, formValues);

  // 清空联动要求清空的字段
  const prevCleared = React.useRef<Set<string>>(new Set());
  React.useEffect(() => {
    if (cleared.size > 0) {
      const newClears: Record<string, any> = {};
      cleared.forEach(f => {
        if (!prevCleared.current.has(f)) newClears[f] = undefined;
      });
      if (Object.keys(newClears).length > 0) form.setFieldsValue(newClears);
    }
    prevCleared.current = cleared;
  }, [cleared]);

  const layoutSettings: FormLayoutSettings = (formData.formConfig?.layoutSettings as FormLayoutSettings) || {};
  const globalColumns = layoutSettings.columns || 2;
  const layout = layoutSettings.layout || 'horizontal';
  const isViewMode = mode === 'view';

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
      labelAlign={layoutSettings.labelAlign}
      size={layoutSettings.size as any}
      variant={layoutSettings.variant as any}
      colon={layoutSettings.colon}
      labelWrap={layoutSettings.labelWrap}
      labelCol={layout === 'horizontal' ? { span: 6 } : undefined}
      wrapperCol={layout === 'horizontal' ? { span: 18 } : undefined}
    >

      {containers.map((container: FormContainer, containerIdx) => {
        if (container.isHidden) return null;

        // container 模式配置
        const containerModeConfig = getModeConfig(mode, container.createMode, container.editMode, container.viewMode);
        if (containerModeConfig === 'hidden') return null;
        const containerForceReadonly = containerModeConfig === 'readonly';

        const cols = container.columns || globalColumns;
        const colSpan = Math.floor(24 / cols);

        const visibleFields = (container.fields || []).filter((field: ContainerField) => {
          if (hidden.has(field.fieldCode)) return false;

          // defaultScopes 控制字段在哪些 mode 下显示
          const scopes = (field as any).extraConfig?.defaultScopes;
          if (scopes && scopes.length > 0 && !scopes.includes(mode)) return false;

          // 字段 mode 配置
          const fieldModeConfig = getModeConfig(mode, (field as any).createMode, (field as any).editMode, (field as any).viewMode);
          if (fieldModeConfig === 'hidden') return false;

          return true;
        });

        return (
          <div key={container.id} style={{ marginBottom: containerIdx < containers.length - 1 ? 20 : 0 }}>
            {container.title && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <AppstoreOutlined style={{ color: '#1a1a1a', fontSize: 14 }} />
                <Typography.Text strong style={{ fontSize: 14, color: '#1a1a1a' }}>
                  {container.title}
                </Typography.Text>
              </div>
            )}

            <Row gutter={[16, 0]}>
              {visibleFields.map((field: ContainerField) => {
                const isRequired = field.required || required.has(field.fieldCode);

                const fieldModeConfig = getModeConfig(mode, (field as any).createMode, (field as any).editMode, (field as any).viewMode);
                const isReadonly =
                  isViewMode ||
                  containerForceReadonly ||
                  fieldModeConfig === 'readonly' ||
                  readonly.has(field.fieldCode);

                const extraConfig = (field as any).extraConfig;
                const isLinkable = isViewMode && extraConfig?.linkable;

                // 注入数据源 options
                const dsCode = field.config?.datasourceCode;
                const resolvedField = dsCode && optionsMap?.[dsCode]
                  ? { ...field, config: { ...field.config, options: optionsMap[dsCode] } }
                  : field;

                return (
                  <Col key={field.fieldCode} span={colSpan}>
                    <FormFieldItem
                      field={{ ...resolvedField, required: isRequired, isHidden: false }}
                      disabled={isReadonly}
                      tooltip={(field as any).tooltip}
                      placeholder={(field as any).placeholder}
                      linkable={isLinkable}
                      linkConfig={isLinkable ? extraConfig : undefined}
                    />
                  </Col>
                );
              })}
            </Row>

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
