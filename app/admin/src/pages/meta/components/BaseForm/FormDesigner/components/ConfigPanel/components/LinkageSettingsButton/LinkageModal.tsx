import React, { useState, useMemo } from 'react';
import { Modal, Button, Space, Card, Select, Input } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { nanoid } from 'nanoid';
import { FieldTypeEnum } from '@/pages/meta/components/BaseField/type';
import type {
  LinkageRule,
  LinkageSettings,
  ConditionOperator,
} from '../../../../types/linkage';
import { CONDITION_OPERATORS } from '../../../../types/linkage';

import './LinkageModal.less';

interface FieldOption {
  fieldCode: string;
  fieldName: string;
  fieldType: string;
}

interface LinkageModalProps {
  open: boolean;
  value?: LinkageSettings;
  fields: FieldOption[]; // 可用字段列表
  onOk: (value: LinkageSettings) => void;
  onCancel: () => void;
}

// 数据源字段类型（有固定选项的字段）
const DATA_SOURCE_FIELD_TYPES = [
  FieldTypeEnum.SingleSelect,
  FieldTypeEnum.MultipleSelect,
  FieldTypeEnum.SingleRadio,
  FieldTypeEnum.MultipleCheckbox,
];

const LinkageModal: React.FC<LinkageModalProps> = ({ open, value, fields, onOk, onCancel }) => {
  const [rules, setRules] = useState<LinkageRule[]>(Array.isArray(value) ? value : []);

  // 当弹窗打开或 value 变化时，同步规则
  React.useEffect(() => {
    if (open) {
      const rulesList = Array.isArray(value) ? value : [];
      console.log('LinkageModal - 同步规则:', rulesList);
      setRules(rulesList);
    }
  }, [open, value]);

  // 添加新规则
  const handleAddRule = () => {
    const newRule: LinkageRule = {
      id: nanoid(),
      condition: {
        field: '',
        operator: '==',
        value: '',
      },
      actions: {},
    };
    setRules([...rules, newRule]);
  };

  // 删除规则
  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  // 更新规则条件（使用函数式更新避免闭包问题）
  const handleUpdateCondition = (
    ruleId: string,
    field: keyof LinkageRule['condition'],
    value: any
  ) => {
    console.log('handleUpdateCondition - 参数:', { ruleId, field, value });
    setRules(prevRules => {
      const newRules = prevRules.map(rule => {
        if (rule.id === ruleId) {
          const newCondition = {
            ...rule.condition,
            [field]: value,
          };
          console.log('handleUpdateCondition - 更新后的condition:', newCondition);
          return {
            ...rule,
            condition: newCondition,
          };
        }
        return rule;
      });
      console.log('handleUpdateCondition - 更新后的rules:', newRules);
      return newRules;
    });
  };

  // 更新规则动作（使用函数式更新避免闭包问题）
  const handleUpdateActions = (
    ruleId: string,
    actionType: keyof LinkageRule['actions'],
    value: string[]
  ) => {
    setRules(prevRules =>
      prevRules.map(rule => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            actions: {
              ...rule.actions,
              [actionType]: value.length > 0 ? value : undefined,
            },
          };
        }
        return rule;
      })
    );
  };

  // 保存
  const handleSave = () => {
    console.log('LinkageModal - 保存规则:', rules);
    onOk(rules);
  };

  // 字段选项
  const fieldOptions = useMemo(() => {
    const options = fields.map(field => ({
      label: `${field.fieldName}(${field.fieldCode})`,
      value: field.fieldCode,
    }));
    console.log('fieldOptions:', options);
    return options;
  }, [fields]);

  // 判断操作符是否需要值
  const needsValue = (operator: ConditionOperator) => {
    return operator !== 'isEmpty' && operator !== 'isNotEmpty';
  };

  // 判断字段是否是数据源字段
  const isDataSourceField = (fieldCode: string) => {
    const field = fields.find(f => f.fieldCode === fieldCode);
    return field && DATA_SOURCE_FIELD_TYPES.includes(field.fieldType as FieldTypeEnum);
  };

  // 获取字段的条件值选项（针对数据源字段）
  const getFieldValueOptions = (fieldCode: string) => {
    const field = fields.find(f => f.fieldCode === fieldCode);
    if (!field) return [];

    // TODO: 这里应该从字段配置中获取实际的选项列表
    // 现在先返回空数组，等待后续从字段配置中获取
    // 对于 SingleSelect, MultipleSelect, SingleRadio, MultipleCheckbox
    // 需要从字段的 dataSource 配置中获取选项
    return [];
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
          {rules.map((rule, index) => {
            console.log(`渲染规则 ${index + 1}:`, rule);
            return (
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
                {/* 触发条件 */}
                <div className="condition-row">
                  <span className="label">触发条件</span>
                  <Space wrap>
                    <span>当</span>
                    <Select
                      style={{ width: 200 }}
                      placeholder="选择字段"
                      value={rule.condition.field ? rule.condition.field : undefined}
                      onChange={value => {
                        console.log('Select onChange - 选择字段:', value, '规则ID:', rule.id);
                        console.log('Select onChange - 当前rule:', rule);
                        // 一次性更新 field 和 value，避免两次调用导致状态覆盖
                        setRules(prevRules =>
                          prevRules.map(r =>
                            r.id === rule.id
                              ? {
                                  ...r,
                                  condition: {
                                    ...r.condition,
                                    field: value,
                                    value: '', // 清空条件值
                                  },
                                }
                              : r
                          )
                        );
                      }}
                      options={fieldOptions}
                      showSearch
                      optionFilterProp="label"
                      allowClear
                    />
                    <Select
                      style={{ width: 120 }}
                      value={rule.condition.operator}
                      onChange={value => handleUpdateCondition(rule.id, 'operator', value)}
                      options={CONDITION_OPERATORS}
                    />
                    {needsValue(rule.condition.operator) && (
                      <>
                        {isDataSourceField(rule.condition.field) ? (
                          <Select
                            style={{ width: 150 }}
                            placeholder="选择条件值"
                            value={rule.condition.value || undefined}
                            onChange={value => handleUpdateCondition(rule.id, 'value', value)}
                            options={getFieldValueOptions(rule.condition.field)}
                            allowClear
                          />
                        ) : (
                          <Input
                            style={{ width: 150 }}
                            placeholder="输入条件值"
                            value={rule.condition.value}
                            onChange={e => handleUpdateCondition(rule.id, 'value', e.target.value)}
                          />
                        )}
                      </>
                    )}
                  </Space>
                </div>

                {/* 执行动作 */}
                <div className="actions-section">
                  <div className="label">执行动作</div>
                  <div className="actions-grid">
                    {/* 显示字段 */}
                    <div className="action-row">
                      <span className="action-label">显示字段</span>
                      <Select
                        mode="multiple"
                        className="action-select"
                        placeholder="选择要显示的字段"
                        value={rule.actions.show || []}
                        onChange={value => handleUpdateActions(rule.id, 'show', value)}
                        options={fieldOptions}
                        maxTagCount="responsive"
                      />
                    </div>

                    {/* 隐藏字段 */}
                    <div className="action-row">
                      <span className="action-label">隐藏字段</span>
                      <Select
                        mode="multiple"
                        className="action-select"
                        placeholder="选择要隐藏的字段"
                        value={rule.actions.hide || []}
                        onChange={value => handleUpdateActions(rule.id, 'hide', value)}
                        options={fieldOptions}
                        maxTagCount="responsive"
                      />
                    </div>

                    {/* 必填字段 */}
                    <div className="action-row">
                      <span className="action-label">必填字段</span>
                      <Select
                        mode="multiple"
                        className="action-select"
                        placeholder="选择必填字段"
                        value={rule.actions.require || []}
                        onChange={value => handleUpdateActions(rule.id, 'require', value)}
                        options={fieldOptions}
                        maxTagCount="responsive"
                      />
                    </div>

                    {/* 非必填字段 */}
                    <div className="action-row">
                      <span className="action-label">非必填</span>
                      <Select
                        mode="multiple"
                        className="action-select"
                        placeholder="选择非必填字段"
                        value={rule.actions.unrequire || []}
                        onChange={value => handleUpdateActions(rule.id, 'unrequire', value)}
                        options={fieldOptions}
                        maxTagCount="responsive"
                      />
                    </div>

                    {/* 只读字段 */}
                    <div className="action-row">
                      <span className="action-label">只读字段</span>
                      <Select
                        mode="multiple"
                        className="action-select"
                        placeholder="选择只读字段"
                        value={rule.actions.readonly || []}
                        onChange={value => handleUpdateActions(rule.id, 'readonly', value)}
                        options={fieldOptions}
                        maxTagCount="responsive"
                      />
                    </div>

                    {/* 可编辑字段 */}
                    <div className="action-row">
                      <span className="action-label">可编辑</span>
                      <Select
                        mode="multiple"
                        className="action-select"
                        placeholder="选择可编辑字段"
                        value={rule.actions.editable || []}
                        onChange={value => handleUpdateActions(rule.id, 'editable', value)}
                        options={fieldOptions}
                        maxTagCount="responsive"
                      />
                    </div>

                    {/* 清空字段 */}
                    <div className="action-row">
                      <span className="action-label">清空字段</span>
                      <Select
                        mode="multiple"
                        className="action-select"
                        placeholder="选择要清空的字段"
                        value={rule.actions.clear || []}
                        onChange={value => handleUpdateActions(rule.id, 'clear', value)}
                        options={fieldOptions}
                        maxTagCount="responsive"
                      />
                    </div>
                  </div>
                </div>
              </Space>
            </Card>
            );
          })}

          {/* 新建规则按钮 */}
          <Button type="dashed" block icon={<PlusOutlined />} onClick={handleAddRule}>
            新建规则
          </Button>
        </Space>
      </div>

      {/* 底部按钮 */}
      <div className="linkage-modal-footer">
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default LinkageModal;
