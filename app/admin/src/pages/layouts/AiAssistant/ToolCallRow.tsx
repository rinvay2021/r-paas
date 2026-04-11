/**
 * ToolCallRow - 工具调用行
 *
 * 借鉴 Claude Code 的设计：
 * - 左侧竖线 gutter（类似 ⎿ 符号），形成层级感
 * - 状态驱动：running(动画点) → success(绿点) → error(红叉)
 * - 极简文字，不用 emoji 图标堆砌
 * - 过渡动画：状态变化时颜色渐变
 */
import React from 'react';
import type { ToolCallMessage } from './types';

// 工具名称到中文描述的映射（补充 description 不够清晰时）
const TOOL_CATEGORY: Record<string, 'query' | 'create' | 'update' | 'delete'> = {
  query_apps: 'query', query_objects: 'query', query_fields: 'query',
  query_forms: 'query', query_lists: 'query', query_search_forms: 'query',
  query_views: 'query', query_action_buttons: 'query', query_menus: 'query',
  query_datasources: 'query', get_datasource: 'query',
  create_meta_object: 'create', batch_create_fields: 'create',
  create_form: 'create', create_list: 'create', create_search_form: 'create',
  create_view: 'create', create_action_buttons: 'create', create_menu: 'create',
  create_datasource: 'create', create_single_form: 'create', create_single_list: 'create',
  create_single_search_form: 'create', create_single_view: 'create', create_single_action_button: 'create',
  update_field: 'update', update_form: 'update', update_list: 'update',
  update_view: 'update', update_action_button: 'update', update_menu: 'update',
  update_datasource_options: 'update',
  delete_field: 'delete', delete_form: 'delete', delete_list: 'delete',
  delete_search_form: 'delete', delete_view: 'delete', delete_action_button: 'delete',
  delete_menu: 'delete', delete_datasource: 'delete',
};

const CATEGORY_COLOR = {
  query: '#8c8c8c',
  create: '#1677ff',
  update: '#fa8c16',
  delete: '#ff4d4f',
};

// 动画点组件（借鉴 Claude Code 的 useBlink）
const BlinkingDot: React.FC = () => {
  const [visible, setVisible] = React.useState(true);
  React.useEffect(() => {
    const id = setInterval(() => setVisible(v => !v), 500);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{
      display: 'inline-block',
      width: 6, height: 6,
      borderRadius: '50%',
      background: '#1677ff',
      opacity: visible ? 1 : 0.2,
      transition: 'opacity 0.15s',
      flexShrink: 0,
    }} />
  );
};

interface ToolCallRowProps {
  message: ToolCallMessage;
  /** 是否是工具组中的最后一条（控制底部间距） */
  isLast?: boolean;
}

const ToolCallRow: React.FC<ToolCallRowProps> = React.memo(({ message, isLast }) => {
  const { toolName, description, status, error } = message;
  const category = TOOL_CATEGORY[toolName] || 'query';
  const categoryColor = CATEGORY_COLOR[category];

  // 延迟状态变化，避免闪烁
  const [displayStatus, setDisplayStatus] = React.useState(status);
  React.useEffect(() => {
    if (status === 'running') { setDisplayStatus('running'); return; }
    const t = setTimeout(() => setDisplayStatus(status), 200);
    return () => clearTimeout(t);
  }, [status]);

  const statusEl = displayStatus === 'running' ? (
    <BlinkingDot />
  ) : displayStatus === 'success' ? (
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#52c41a', display: 'inline-block', flexShrink: 0 }} />
  ) : (
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4d4f', display: 'inline-block', flexShrink: 0 }} />
  );

  const textColor = displayStatus === 'running'
    ? '#595959'
    : displayStatus === 'success'
      ? '#8c8c8c'
      : '#ff4d4f';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '3px 0',
      marginBottom: isLast ? 0 : 1,
    }}>
      {/* 状态点 */}
      <div style={{ width: 16, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        {statusEl}
      </div>

      {/* 描述文字 */}
      <span style={{
        fontSize: 12,
        color: textColor,
        transition: 'color 0.3s',
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        lineHeight: '20px',
      }}>
        {description}
      </span>

      {/* 类型标签（仅 running 时显示，给用户感知） */}
      {displayStatus === 'running' && (
        <span style={{
          fontSize: 10,
          color: categoryColor,
          background: `${categoryColor}12`,
          border: `1px solid ${categoryColor}30`,
          borderRadius: 3,
          padding: '0 5px',
          lineHeight: '16px',
          flexShrink: 0,
        }}>
          {category === 'query' ? '查询' : category === 'create' ? '创建' : category === 'update' ? '更新' : '删除'}
        </span>
      )}

      {/* 错误信息 */}
      {displayStatus === 'error' && error && (
        <span style={{ fontSize: 11, color: '#ff4d4f', flexShrink: 0, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {error}
        </span>
      )}
    </div>
  );
});

ToolCallRow.displayName = 'ToolCallRow';
export default ToolCallRow;
