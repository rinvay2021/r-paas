import React from 'react';
import {
  Button, Switch, Input, Tag, Checkbox,
  Typography, Divider,
} from 'antd';
import {
  CheckOutlined, CloseOutlined,
  AppstoreOutlined, FieldTimeOutlined, BulbOutlined,
  MenuOutlined, PlusOutlined, DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { ConfirmPlan, ConfirmPlanButton } from '@/api/ai/interface';

const { Text } = Typography;

const FIELD_TYPE_LABEL: Record<string, string> = {
  Text: '文本', Text_Number: '数字', Textarea: '多行文本', Text_Rich: '富文本',
  DatePicker: '日期', MonthPicker: '月份', YearPicker: '年份', TimePicker: '时间',
  SingleSelect: '单选', MultipleSelect: '多选', SingleRadio: '单选框', MultipleCheckbox: '多选框',
  TreeSelect: '树选择', Cascader: '级联', LocationSelect: '地区',
  FileUpload: '文件', ImageUpload: '图片', ColorSelect: '颜色',
};

const FIELD_TYPE_COLOR: Record<string, string> = {
  Text: 'default', Text_Number: 'blue', Textarea: 'default', Text_Rich: 'purple',
  DatePicker: 'orange', MonthPicker: 'orange', YearPicker: 'orange', TimePicker: 'orange',
  SingleSelect: 'cyan', MultipleSelect: 'cyan', SingleRadio: 'cyan', MultipleCheckbox: 'cyan',
  TreeSelect: 'geekblue', Cascader: 'geekblue', LocationSelect: 'geekblue',
  FileUpload: 'volcano', ImageUpload: 'magenta', ColorSelect: 'lime',
};

const BUTTON_LEVEL_LABEL: Record<string, string> = {
  View: '顶部', List: '列表', ListRow: '行内', DetailPage: '详情',
};

const DEFAULT_BUTTON_OPTIONS: ConfirmPlanButton[] = [
  { buttonName: '新建', buttonCode: 'create', buttonLevel: 'View', buttonEvent: 'Create', buttonOrder: 1, userSpecified: false },
  { buttonName: '编辑', buttonCode: 'update', buttonLevel: 'List', buttonEvent: 'Update', buttonOrder: 2, userSpecified: false },
  { buttonName: '删除', buttonCode: 'delete', buttonLevel: 'List', buttonEvent: 'Delete', buttonOrder: 3, userSpecified: false },
  { buttonName: '批量删除', buttonCode: 'batchDelete', buttonLevel: 'List', buttonEvent: 'BatchDelete', buttonOrder: 4, userSpecified: false },
  { buttonName: '批量编辑', buttonCode: 'batchUpdate', buttonLevel: 'List', buttonEvent: 'BatchUpdate', buttonOrder: 5, userSpecified: false },
  { buttonName: '导出', buttonCode: 'export', buttonLevel: 'List', buttonEvent: 'Export', buttonOrder: 6, userSpecified: false },
  { buttonName: '导入', buttonCode: 'import', buttonLevel: 'List', buttonEvent: 'Import', buttonOrder: 7, userSpecified: false },
];

// 数据源选项编辑器
const DatasourceEditor: React.FC<{
  fieldName: string;
  datasourceCode: string;
  options: Array<{ optionName: string; optionCode: string }>;
  onChange: (opts: Array<{ optionName: string; optionCode: string }>) => void;
}> = ({ fieldName, datasourceCode, options, onChange }) => {
  const addOption = () => onChange([...options, { optionName: '', optionCode: '' }]);
  const removeOption = (i: number) => onChange(options.filter((_, idx) => idx !== i));
  const updateOption = (i: number, key: 'optionName' | 'optionCode', val: string) =>
    onChange(options.map((o, idx) => idx === i ? { ...o, [key]: val } : o));

  return (
    <div style={{ marginTop: 6, padding: '10px 12px', background: '#f8f9ff', borderRadius: 6, border: '1px solid #d6e4ff' }}>
      <div style={{ fontSize: 11, color: '#1677ff', marginBottom: 8, fontWeight: 500 }}>
        ✏️ 配置「{fieldName}」的选项（数据源：{datasourceCode}）
      </div>
      {options.length === 0 && (
        <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>暂无选项，请添加</div>
      )}
      {options.map((opt, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
          <Input size="small" placeholder="选项名称（如：待处理）" value={opt.optionName}
            onChange={e => updateOption(i, 'optionName', e.target.value)} style={{ flex: 1 }} />
          <Input size="small" placeholder="编码（如：pending）" value={opt.optionCode}
            onChange={e => updateOption(i, 'optionCode', e.target.value)} style={{ flex: 1 }} />
          <Button type="text" size="small" icon={<DeleteOutlined />} danger onClick={() => removeOption(i)} />
        </div>
      ))}
      <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addOption}
        style={{ width: '100%', fontSize: 11 }}>
        添加选项
      </Button>
    </div>
  );
};

interface ConfirmPlanProps {
  plan: ConfirmPlan;
  onConfirm: (plan: ConfirmPlan) => void;
  onCancel: () => void;
}

const ConfirmPlanCard: React.FC<ConfirmPlanProps> = ({ plan, onConfirm, onCancel }) => {
  // editPlan.buttons 始终用 DEFAULT_BUTTON_OPTIONS 作为完整选项池
  // AI 推荐的按钮用于设置初始勾选状态
  const [editPlan, setEditPlan] = React.useState<ConfirmPlan>(() => ({
    ...plan,
    buttons: DEFAULT_BUTTON_OPTIONS,
  }));

  const [selectedButtonCodes, setSelectedButtonCodes] = React.useState<string[]>(() => {
    // 如果 AI 推荐了按钮，用 AI 推荐的 code 作为初始勾选
    // 否则默认勾选：新建、编辑、删除、批量删除
    if (plan.buttons.length > 0) {
      return plan.buttons.map(b => b.buttonCode);
    }
    return ['create', 'update', 'delete', 'batchDelete'];
  });

  const handleConfirm = () => {
    // 从 DEFAULT_BUTTON_OPTIONS 中取出用户勾选的按钮，保留完整的按钮配置
    const finalButtons = DEFAULT_BUTTON_OPTIONS
      .filter(b => selectedButtonCodes.includes(b.buttonCode))
      .map((b, idx) => ({ ...b, buttonOrder: idx + 1, userSpecified: true }));
    onConfirm({ ...editPlan, buttons: finalButtons });
  };

  const datasourceFields = editPlan.fields.filter((f: any) => f.datasourceCode);

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e8e8e8',
      borderRadius: 10,
      overflow: 'hidden',
      margin: '4px 0 4px 0',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    }}>
      {/* 标题 */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a1a, #333)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <AppstoreOutlined style={{ color: '#fff', fontSize: 15 }} />
        <div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>
            即将创建：{editPlan.objectName}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 1 }}>
            应用：{editPlan.appCode} · 请确认以下配置，可按需调整
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* 字段 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <FieldTimeOutlined style={{ color: '#1677ff', fontSize: 13 }} />
            <Text strong style={{ fontSize: 12 }}>字段配置</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>共 {editPlan.fields.length} 个</Text>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {editPlan.fields.map(f => (
              <Tag
                key={f.fieldCode}
                color={FIELD_TYPE_COLOR[f.fieldType] || 'default'}
                style={{ fontSize: 11, margin: 0, borderRadius: 4 }}
              >
                {f.fieldName}
                <span style={{ opacity: 0.7, marginLeft: 3 }}>
                  {FIELD_TYPE_LABEL[f.fieldType] || f.fieldType}
                </span>
                {(f as any).datasourceCode && (
                  <span style={{ marginLeft: 3, opacity: 0.8 }}>📊</span>
                )}
              </Tag>
            ))}
          </div>
          {/* 数据源字段选项配置 */}
          {datasourceFields.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>
                💡 以下字段使用数据源，请确认选项内容：
              </div>
              {datasourceFields.map((f: any) => (
                <DatasourceEditor
                  key={f.fieldCode}
                  fieldName={f.fieldName}
                  datasourceCode={f.datasourceCode}
                  options={f.datasourceOptions || []}
                  onChange={opts => setEditPlan(p => ({
                    ...p,
                    fields: p.fields.map((pf: any) =>
                      pf.fieldCode === f.fieldCode ? { ...pf, datasourceOptions: opts } : pf
                    ),
                  }))}
                />
              ))}
            </div>
          )}
        </div>

        <Divider style={{ margin: 0 }} />

        {/* 功能按钮 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <BulbOutlined style={{ color: '#fa8c16', fontSize: 13 }} />
            <Text strong style={{ fontSize: 12 }}>功能按钮</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {plan.userSpecified.buttons ? '已按您的要求预选，可调整' : '已为您推荐，可按需勾选'}
            </Text>
          </div>
          <Checkbox.Group
            value={selectedButtonCodes}
            onChange={vals => setSelectedButtonCodes(vals as string[])}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DEFAULT_BUTTON_OPTIONS.map(opt => {
                const isSelected = selectedButtonCodes.includes(opt.buttonCode);
                return (
                  <Checkbox key={opt.buttonCode} value={opt.buttonCode}>
                    <span style={{ fontSize: 12 }}>{opt.buttonName}</span>
                    <Tag
                      style={{ fontSize: 10, marginLeft: 4, padding: '0 4px' }}
                      color={isSelected ? 'blue' : 'default'}
                    >
                      {BUTTON_LEVEL_LABEL[opt.buttonLevel]}
                    </Tag>
                  </Checkbox>
                );
              })}
            </div>
          </Checkbox.Group>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* 菜单 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <MenuOutlined style={{ color: '#722ed1', fontSize: 13 }} />
          <Text strong style={{ fontSize: 12 }}>创建菜单</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {plan.userSpecified.menu ? '（已按您的要求预设，可调整）' : '（推荐创建，方便在门户访问）'}
          </Text>
          <Switch
            size="small"
            checked={editPlan.createMenu}
            onChange={v => setEditPlan(p => ({ ...p, createMenu: v }))}
          />
          {editPlan.createMenu && (
            <Input
              size="small"
              value={editPlan.menuName || editPlan.objectName}
              onChange={e => setEditPlan(p => ({ ...p, menuName: e.target.value }))}
              placeholder="菜单名称"
              style={{ width: 140, fontSize: 12 }}
              prefix={<span style={{ fontSize: 10, color: '#999' }}>名称</span>}
            />
          )}
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
            确认后将按顺序自动创建所有配置
          </Text>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="small" icon={<CloseOutlined />} onClick={onCancel}>
              取消
            </Button>
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleConfirm}
              style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
            >
              确认，开始创建
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPlanCard;
