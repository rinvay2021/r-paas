import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Space, Card, Select, Input } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
// @ts-expect-error: nanoid 是纯 ESM 包，但在 CommonJS 环境下通过 require 引入会有类型冲突，但运行时通常没问题
import { nanoid } from 'nanoid';
import { FieldTypeEnum } from '@/pages/meta/components/BaseField/type';
import { datasourceService } from '@/api/datasource';
import { useMeta } from '@/store/metaAtom';
import type { LinkageRule, LinkageSettings, ConditionOperator } from '../../../../types/linkage';
import { CONDITION_OPERATORS } from '../../../../types/linkage';

import './LinkageModal.less';

interface FieldOption {
  fieldCode: string;
  fieldName: string;
  fieldType: string;
  datasourceCode?: string;
}

interface LinkageModalProps {
  open: boolean;
  value?: LinkageSettings;
  fields: FieldOption[];
  onOk: (value: LinkageSettings) => void;
  onCancel: () => void;
}

const DATA_SOURCE_FIELD_TYPES = [
  FieldTypeEnum.SingleSelect,
  FieldTypeEnum.MultipleSelect,
  FieldTypeEnum.SingleRadio,
  FieldTypeEnum.MultipleCheckbox,
];

const LinkageModal: React.FC<LinkageModalProps> = ({ open, value, fields, onOk, onCancel }) => {
  const { appCode } = useMeta();
  const [rules, setRules] = useState<LinkageRule[]>([]);
  const [datasourceOptionsMap, setDatasourceOptionsMap] = useState<
    Record<string, { label: string; value: string }[]>
  >({});

  useEffect(() => {
    if (!open) return;
    setRules(Array.isArray(value) ? value : []);

    const codesNeeded = fields
      .filter(
        f => DATA_SOURCE_FIELD_TYPES.includes(f.fieldType as FieldTypeEnum) && f.datasourceCode
      )
      .map(f => f.datasourceCode!);

    if (codesNeeded.length === 0 || !appCode) return;

    datasourceService
      .queryDatasources({ appCode, pageSize: -1 })
      .then(res => {
        const list = res?.data?.list || [];
        const map: Record<string, { label: string; value: string }[]> = {};
        list.forEach(ds => {
          if (codesNeeded.includes(ds.datasourceCode)) {
            map[ds.datasourceCode] = (ds.options || [])
              .filter(opt => opt.isEnabled !== 0)
              .map(opt => ({ label: opt.optionName, value: opt.optionCode }));
          }
        });
        setDatasourceOptionsMap(map);
      })
      .catch(() => {});
  }, [open, value, fields, appCode]);

  const handleAddRule = () => {
    setRules(prev => [
      ...prev,
      {
        id: nanoid(),
        condition: { field: '', operator: 'eq', value: '' },
        actions: {},
      },
    ]);
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const handleUpdateCondition = (
    ruleId: string,
    field: keyof LinkageRule['condition'],
    val: any
  ) => {
    setRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, condition: { ...r.condition, [field]: val } } : r))
    );
  };

  const handleUpdateActions = (
    ruleId: string,
    actionType: keyof LinkageRule['actions'],
    val: string[]
  ) => {
    setRules(prev =>
      prev.map(r =>
        r.id === ruleId
          ? { ...r, actions: { ...r.actions, [actionType]: val.length > 0 ? val : undefined } }
          : r
      )
    );
  };

  const fieldOptions = useMemo(
    () =>
      fields.map(f => ({
        label: f.fieldName !== f.fieldCode ? `${f.fieldName}(${f.fieldCode})` : f.fieldName,
        value: f.fieldCode,
      })),
    [fields]
  );

  const needsValue = (op: ConditionOperator) => op !== 'empty' && op !== 'notEmpty';

  const getFieldDatasourceCode = (fieldCode: string) => {
    const f = fields.find(f => f.fieldCode === fieldCode);
    return f && DATA_SOURCE_FIELD_TYPES.includes(f.fieldType as FieldTypeEnum)
      ? f.datasourceCode
      : undefined;
  };

  return (
    <Modal
      title="联动设置"
      open={open}
      onCancel={onCancel}
      width={900}
      footer={null}
      className="linkage-modal"
    >
      <div className="linkage-modal-content">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {rules.map((rule, index) => (
            <Card
              key={rule.id}
              size="small"
              title={`规则 ${index + 1}`}
              extra={
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteRule(rule.id)}
                >
                  删除
                </Button>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <div className="condition-row">
                  <span className="label">触发条件</span>
                  <Space wrap>
                    <span>当</span>
                    <Select
                      style={{ width: 200 }}
                      placeholder="选择字段"
                      value={rule.condition.field || undefined}
                      onChange={val =>
                        setRules(prev =>
                          prev.map(r =>
                            r.id === rule.id
                              ? { ...r, condition: { ...r.condition, field: val, value: '' } }
                              : r
                          )
                        )
                      }
                      options={fieldOptions}
                      showSearch
                      optionFilterProp="label"
                      allowClear
                    />
                    <Select
                      style={{ width: 120 }}
                      value={rule.condition.operator}
                      onChange={val => handleUpdateCondition(rule.id, 'operator', val)}
                      options={CONDITION_OPERATORS as any}
                    />
                    {needsValue(rule.condition.operator) &&
                      (() => {
                        const dsCode = getFieldDatasourceCode(rule.condition.field);
                        const dsOptions = dsCode ? datasourceOptionsMap[dsCode] : undefined;
                        return dsOptions ? (
                          <Select
                            style={{ width: 150 }}
                            placeholder="选择条件值"
                            value={rule.condition.value || undefined}
                            onChange={val => handleUpdateCondition(rule.id, 'value', val)}
                            options={dsOptions}
                            allowClear
                          />
                        ) : (
                          <Input
                            style={{ width: 150 }}
                            placeholder="输入条件值"
                            value={rule.condition.value}
                            onChange={e => handleUpdateCondition(rule.id, 'value', e.target.value)}
                          />
                        );
                      })()}
                  </Space>
                </div>

                <div className="actions-section">
                  <div className="label">执行动作</div>
                  <div className="actions-grid">
                    {[
                      { key: 'show', label: '显示字段', placeholder: '选择要显示的字段' },
                      { key: 'hide', label: '隐藏字段', placeholder: '选择要隐藏的字段' },
                      { key: 'require', label: '必填字段', placeholder: '选择必填字段' },
                      { key: 'unrequire', label: '非必填', placeholder: '选择非必填字段' },
                      { key: 'readonly', label: '只读字段', placeholder: '选择只读字段' },
                      { key: 'editable', label: '可编辑', placeholder: '选择可编辑字段' },
                      { key: 'clear', label: '清空字段', placeholder: '选择要清空的字段' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key} className="action-row">
                        <span className="action-label">{label}</span>
                        <Select
                          mode="multiple"
                          className="action-select"
                          placeholder={placeholder}
                          value={(rule.actions as any)[key] || []}
                          onChange={val =>
                            handleUpdateActions(rule.id, key as keyof LinkageRule['actions'], val)
                          }
                          options={fieldOptions}
                          maxTagCount="responsive"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Space>
            </Card>
          ))}
          <Button type="dashed" block icon={<PlusOutlined />} onClick={handleAddRule}>
            新建规则
          </Button>
        </Space>
      </div>
      <div className="linkage-modal-footer">
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="default" onClick={() => onOk(rules)}>
            保存
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default LinkageModal;
