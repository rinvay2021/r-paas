# 表单联动功能使用说明

## 功能概述

表单联动功能允许你根据某个字段的值，动态控制其他字段的显示、隐藏、必填、只读等状态。

## 支持的联动类型

1. **显示/隐藏字段** - 根据条件显示或隐藏字段
2. **必填/非必填** - 根据条件设置字段是否必填
3. **只读/可编辑** - 根据条件设置字段是否可编辑
4. **清空字段** - 根据条件清空字段的值

## 配置方式

### 1. 在表单设计器中配置

在表单配置面板中，点击"联动设置"按钮，打开联动配置弹窗。

### 2. 配置规则

每个联动规则包含：

#### 触发条件
- **字段**：选择作为触发条件的字段
- **操作符**：选择比较操作符
  - 等于 (==)
  - 不等于 (!=)
  - 大于 (>)
  - 小于 (<)
  - 大于等于 (>=)
  - 小于等于 (<=)
  - 包含 (contains)
  - 为空 (isEmpty)
  - 不为空 (isNotEmpty)
- **值**：输入比较值（isEmpty 和 isNotEmpty 不需要值）

#### 执行动作
- **显示字段**：当条件满足时，显示这些字段
- **隐藏字段**：当条件满足时，隐藏这些字段
- **必填字段**：当条件满足时，这些字段变为必填
- **非必填**：当条件满足时，这些字段变为非必填
- **只读字段**：当条件满足时，这些字段变为只读
- **可编辑**：当条件满足时，这些字段变为可编辑
- **清空字段**：当条件满足时，清空这些字段的值

## 使用示例

### 示例 1：根据"是否有配偶"显示配偶信息

**规则配置：**
- 触发条件：当 `hasSpouse` 等于 `是`
- 执行动作：
  - 显示字段：`spouseName`, `spouseAge`
  - 必填字段：`spouseName`

**效果：**
- 当用户选择"是否有配偶"为"是"时，显示"配偶姓名"和"配偶年龄"字段，且"配偶姓名"为必填
- 当用户选择"是否有配偶"为"否"时，隐藏"配偶姓名"和"配偶年龄"字段，且"配偶姓名"变为非必填

### 示例 2：根据配送方式显示地址

**规则配置：**
- 触发条件：当 `deliveryType` 等于 `快递`
- 执行动作：
  - 显示字段：`address`, `phone`
  - 必填字段：`address`, `phone`

**效果：**
- 当用户选择"配送方式"为"快递"时，显示"收货地址"和"联系电话"字段，且都为必填
- 当用户选择其他配送方式时，隐藏这些字段

### 示例 3：根据订单金额显示优惠券

**规则配置：**
- 触发条件：当 `totalAmount` 大于等于 `100`
- 执行动作：
  - 显示字段：`couponCode`

**效果：**
- 当订单金额 >= 100 时，显示"优惠券"字段
- 当订单金额 < 100 时，隐藏"优惠券"字段

## 高级特性

### 1. 反向联动（自动恢复）

当条件不满足时，系统会自动执行反向操作：
- 显示 → 隐藏
- 隐藏 → 显示
- 必填 → 非必填
- 非必填 → 必填
- 只读 → 可编辑
- 可编辑 → 只读

### 2. 冲突处理

当多个规则作用于同一个字段时，遵循以下优先级：
- **显隐规则**：隐藏优先（任何一个规则要求隐藏就隐藏）
- **必填规则**：必填优先（任何一个规则要求必填就必填）
- **只读规则**：只读优先（任何一个规则要求只读就只读）
- **清空规则**：按规则定义顺序执行

## 在代码中使用

### 在表单预览/渲染中使用

```tsx
import { Form } from 'antd';
import { useLinkage } from './hooks/useLinkage';
import type { LinkageRule } from './types/linkage';

function FormPreview({ formConfig, fields }) {
  const [form] = Form.useForm();

  // 使用联动 Hook
  const { isFieldVisible, isFieldRequired, isFieldReadonly } = useLinkage({
    rules: formConfig.linkageSettings?.rules || [],
    form,
    fields: fields.map(f => f.fieldCode),
  });

  return (
    <Form form={form}>
      {fields.map(field => {
        // 根据联动状态决定是否渲染字段
        if (!isFieldVisible(field.fieldCode)) {
          return null;
        }

        return (
          <Form.Item
            key={field.fieldCode}
            name={field.fieldCode}
            label={field.fieldName}
            required={isFieldRequired(field.fieldCode)}
          >
            <Input
              disabled={isFieldReadonly(field.fieldCode)}
              placeholder={`请输入${field.fieldName}`}
            />
          </Form.Item>
        );
      })}
    </Form>
  );
}
```

## 数据结构

### LinkageSettings

```typescript
interface LinkageSettings {
  rules: LinkageRule[];
}
```

### LinkageRule

```typescript
interface LinkageRule {
  id: string;                    // 规则ID
  condition: LinkageCondition;   // 触发条件
  actions: LinkageActions;       // 执行动作
}
```

### LinkageCondition

```typescript
interface LinkageCondition {
  field: string;                 // 字段编码
  operator: ConditionOperator;   // 操作符
  value: any;                    // 条件值
}
```

### LinkageActions

```typescript
interface LinkageActions {
  show?: string[];        // 显示的字段列表
  hide?: string[];        // 隐藏的字段列表
  require?: string[];     // 必填的字段列表
  unrequire?: string[];   // 非必填的字段列表
  readonly?: string[];    // 只读的字段列表
  editable?: string[];    // 可编辑的字段列表
  clear?: string[];       // 清空的字段列表
}
```

## 注意事项

1. **循环依赖**：避免创建循环依赖的联动规则（例如：A 控制 B，B 又控制 A）
2. **性能考虑**：联动规则会在表单值变化时触发，过多的规则可能影响性能
3. **字段清空**：清空操作会立即清除字段值，请谨慎使用
4. **必填校验**：联动设置的必填状态会覆盖字段的默认必填设置

## 未来扩展

以下功能暂未实现，可在后续版本中扩展：

1. **多条件组合**：支持 AND/OR 组合多个条件
2. **值联动**：根据其他字段的值自动计算当前字段的值
3. **选项联动**：根据其他字段的值动态改变下拉选项
4. **自定义函数**：支持自定义 JavaScript 函数进行复杂联动
5. **API 联动**：根据字段值调用 API 获取数据
