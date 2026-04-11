/**
 * MessageList - 消息列表
 *
 * 核心设计思想（借鉴 Claude Code）：
 *
 * 1. 扁平消息流：不按 user/assistant 分组，消息是有序的流，
 *    每条消息自己决定如何渲染。这样工具调用天然地夹在文字消息之间，
 *    不需要额外的 "ops 块" 概念。
 *
 * 2. 连续工具调用自动合并到同一个 gutter 容器：
 *    通过 buildRenderGroups() 扫描连续的 tool_call 消息，
 *    合并为一个 ToolGroup，共享左侧 gutter。
 *    文字消息和用户消息不影响合并逻辑（因为它们不是 tool_call）。
 *
 * 3. Gutter 模式（借鉴 Claude Code 的 ⎿ 符号）：
 *    工具调用组左侧有一条竖线，形成层级感，
 *    视觉上表达"这些是 AI 在幕后做的事情"。
 *
 * 4. Loading 状态：由 loading prop 驱动，不依赖消息内容，
 *    避免空占位消息的复杂管理。
 */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button, Space } from 'antd';
import { ExclamationCircleOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import type { NormalizedMessage, ConfirmPlan } from './types';
import { isToolCall } from './types';
import ToolCallRow from './ToolCallRow';
import ConfirmPlanCard from './ConfirmPlan';

// ── Markdown 渲染配置（抽出来避免每次渲染重新创建对象） ────────────────────
const MD_COMPONENTS = {
  table: ({ node: _n, ...props }: any) => (
    <div style={{ overflowX: 'auto', margin: '6px 0' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }} {...props} />
    </div>
  ),
  th: ({ node: _n, ...props }: any) => (
    <th style={{ border: '1px solid #e8e8e8', padding: '4px 8px', background: '#fafafa', whiteSpace: 'nowrap' }} {...props} />
  ),
  td: ({ node: _n, ...props }: any) => (
    <td style={{ border: '1px solid #e8e8e8', padding: '4px 8px' }} {...props} />
  ),
  code: ({ node: _n, inline, ...props }: any) => inline
    ? <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 3, fontSize: 12 }} {...props} />
    : <code style={{ display: 'block', background: '#f5f5f5', padding: '10px 12px', borderRadius: 6, fontSize: 12, overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.6 }} {...props} />,
  p: ({ node: _n, ...props }: any) => <p style={{ margin: '4px 0' }} {...props} />,
  ul: ({ node: _n, ...props }: any) => <ul style={{ paddingLeft: 20, margin: '4px 0' }} {...props} />,
  ol: ({ node: _n, ...props }: any) => <ol style={{ paddingLeft: 20, margin: '4px 0' }} {...props} />,
  li: ({ node: _n, ...props }: any) => <li style={{ marginBottom: 2 }} {...props} />,
  a: ({ node: _n, ...props }: any) => <a style={{ wordBreak: 'break-all' }} target="_blank" rel="noopener noreferrer" {...props} />,
  h1: ({ node: _n, ...props }: any) => <h1 style={{ fontSize: 15, fontWeight: 600, margin: '8px 0 4px' }} {...props} />,
  h2: ({ node: _n, ...props }: any) => <h2 style={{ fontSize: 14, fontWeight: 600, margin: '6px 0 4px' }} {...props} />,
  h3: ({ node: _n, ...props }: any) => <h3 style={{ fontSize: 13, fontWeight: 600, margin: '4px 0 2px' }} {...props} />,
  blockquote: ({ node: _n, ...props }: any) => (
    <blockquote style={{ borderLeft: '3px solid #d9d9d9', margin: '6px 0', paddingLeft: 10, color: '#666' }} {...props} />
  ),
};

// ── 渲染分组：连续 tool_call 合并为 ToolGroup ─────────────────────────────
type RenderItem =
  | { kind: 'tool_group'; messages: NormalizedMessage[] }
  | { kind: 'single'; message: NormalizedMessage };

function buildRenderItems(messages: NormalizedMessage[]): RenderItem[] {
  const items: RenderItem[] = [];
  for (const msg of messages) {
    if (isToolCall(msg)) {
      const last = items[items.length - 1];
      if (last?.kind === 'tool_group') {
        last.messages.push(msg);
      } else {
        items.push({ kind: 'tool_group', messages: [msg] });
      }
    } else {
      items.push({ kind: 'single', message: msg });
    }
  }
  return items;
}

// ── 子组件 ────────────────────────────────────────────────────────────────────

/** 用户消息气泡 */
const UserBubble: React.FC<{ content: string }> = React.memo(({ content }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '12px 0 4px' }}>
    <div style={{
      maxWidth: '78%',
      background: '#1a1a1a',
      color: '#fff',
      borderRadius: '14px 14px 3px 14px',
      padding: '9px 13px',
      fontSize: 13,
      lineHeight: 1.65,
      wordBreak: 'break-word',
      overflowWrap: 'anywhere',
      whiteSpace: 'pre-wrap',
    }}>
      {content}
    </div>
  </div>
));
UserBubble.displayName = 'UserBubble';

/** AI 文字消息（无气泡，直接渲染，借鉴 Claude Code 的 AssistantTextMessage） */
const AssistantText: React.FC<{ content: string; streaming?: boolean }> = React.memo(({ content, streaming }) => (
  <div style={{
    fontSize: 13,
    lineHeight: 1.75,
    color: '#1a1a1a',
    margin: '10px 0 4px',
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
  }}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
      {content}
    </ReactMarkdown>
    {streaming && <span className="ai-typing-cursor" />}
  </div>
));
AssistantText.displayName = 'AssistantText';

/** 工具调用组（带左侧 gutter） */
const ToolGroup: React.FC<{ messages: NormalizedMessage[]; isLastGroup: boolean; loading: boolean }> = React.memo(
  ({ messages, isLastGroup, loading }) => {
    const toolCalls = messages.filter(isToolCall);
    const hasRunning = toolCalls.some(m => m.status === 'running');

    return (
      <div style={{
        display: 'flex',
        gap: 0,
        margin: '8px 0',
      }}>
        {/* 左侧 gutter 竖线（借鉴 Claude Code 的 ⎿ 符号思想） */}
        <div style={{
          width: 2,
          borderRadius: 2,
          background: hasRunning ? '#1677ff' : toolCalls.every(m => m.status === 'success') ? '#52c41a30' : '#f0f0f0',
          marginRight: 12,
          flexShrink: 0,
          transition: 'background 0.4s',
          alignSelf: 'stretch',
          minHeight: 20,
        }} />

        {/* 工具调用列表 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {toolCalls.map((msg, i) => (
            <ToolCallRow key={msg.id} message={msg as any} isLast={i === toolCalls.length - 1} />
          ))}
          {/* loading 且是最后一组，显示等待下一个工具 */}
          {isLastGroup && loading && !hasRunning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
              <div style={{ width: 16, display: 'flex', justifyContent: 'center' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d9d9d9', display: 'inline-block', animation: 'ai-dot-pulse 1.2s ease infinite' }} />
              </div>
              <span style={{ fontSize: 12, color: '#bfbfbf' }}>思考中...</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);
ToolGroup.displayName = 'ToolGroup';

/** 破坏性操作确认 */
const ActionConfirm: React.FC<{ message: any }> = React.memo(({ message }) => {
  const { description, isDelete, state } = message;

  if (state !== 'pending') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '6px 0', color: state === 'confirmed' ? '#52c41a' : '#8c8c8c', fontSize: 12 }}>
        {state === 'confirmed'
          ? <CheckCircleFilled style={{ fontSize: 12 }} />
          : <CloseCircleFilled style={{ fontSize: 12 }} />}
        <span>{state === 'confirmed' ? '已确认执行' : '已取消'}</span>
      </div>
    );
  }

  return (
    <div style={{
      background: isDelete ? '#fff2f0' : '#fffbe6',
      border: `1px solid ${isDelete ? '#ffa39e' : '#ffe58f'}`,
      borderRadius: 8,
      padding: '10px 14px',
      margin: '8px 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
        <ExclamationCircleOutlined style={{ color: isDelete ? '#ff4d4f' : '#faad14', fontSize: 14, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 2 }}>
            {isDelete ? '确认删除？' : '确认修改？'}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>{description}</div>
        </div>
      </div>
      <Space size={8}>
        <Button size="small" type="primary" danger={isDelete}
          style={!isDelete ? { background: '#1a1a1a', borderColor: '#1a1a1a' } : undefined}
          onClick={() => (window as any)[`__actionConfirm_${message.id}`]?.(true)}>
          确认
        </Button>
        <Button size="small" onClick={() => (window as any)[`__actionConfirm_${message.id}`]?.(false)}>
          取消
        </Button>
      </Space>
    </div>
  );
});
ActionConfirm.displayName = 'ActionConfirm';

/** 错误消息 */
const ErrorRow: React.FC<{ content: string }> = React.memo(({ content }) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    margin: '8px 0',
    padding: '8px 12px',
    background: '#fff2f0',
    border: '1px solid #ffccc7',
    borderRadius: 6,
    fontSize: 12,
    color: '#cf1322',
  }}>
    <CloseCircleFilled style={{ fontSize: 13, marginTop: 1, flexShrink: 0 }} />
    <span>{content}</span>
  </div>
));
ErrorRow.displayName = 'ErrorRow';

/** 初始 loading 状态（还没有任何工具调用时） */
const ThinkingIndicator: React.FC = () => {
  const [dots, setDots] = React.useState(1);
  React.useEffect(() => {
    const id = setInterval(() => setDots(d => d >= 3 ? 1 : d + 1), 400);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0', color: '#8c8c8c', fontSize: 13 }}>
      <span style={{ letterSpacing: 2 }}>{'●'.repeat(dots)}{'○'.repeat(3 - dots)}</span>
      <span>思考中</span>
    </div>
  );
};

// ── 欢迎屏 ────────────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: '创建业务模块', text: '帮我创建一个' },
  { label: '查询现有配置', text: '查询当前应用有哪些对象' },
  { label: '修改字段', text: '修改' },
  { label: '删除配置', text: '删除' },
];

const WelcomeScreen: React.FC<{ onQuickPrompt: (text: string) => void }> = ({ onQuickPrompt }) => (
  <div style={{ padding: '24px 0 16px' }}>
    <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>
      AI 元数据助手
    </div>
    <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 20, lineHeight: 1.6 }}>
      通过自然语言快速配置元数据，无需手动操作多个页面。
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {QUICK_PROMPTS.map(p => (
        <button
          key={p.label}
          onClick={() => onQuickPrompt(p.text)}
          style={{
            background: '#f5f5f5',
            border: '1px solid #e8e8e8',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 12,
            color: '#595959',
            cursor: 'pointer',
            transition: 'all 0.15s',
            outline: 'none',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#e6f4ff';
            (e.currentTarget as HTMLElement).style.borderColor = '#91caff';
            (e.currentTarget as HTMLElement).style.color = '#1677ff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = '#f5f5f5';
            (e.currentTarget as HTMLElement).style.borderColor = '#e8e8e8';
            (e.currentTarget as HTMLElement).style.color = '#595959';
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  </div>
);

// ── 主组件 ────────────────────────────────────────────────────────────────────
interface MessageListProps {
  messages: NormalizedMessage[];
  loading: boolean;
  onConfirmPlan: (msgId: string, plan: ConfirmPlan) => void;
  onCancelPlan: (msgId: string) => void;
  onQuickPrompt: (text: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages, loading, onConfirmPlan, onCancelPlan, onQuickPrompt,
}) => {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, loading]);

  const renderItems = React.useMemo(() => buildRenderItems(messages), [messages]);

  // 判断最后一个 render item 是否是 tool_group（用于传 isLastGroup）
  const lastItemIndex = renderItems.length - 1;

  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 20px 12px' }}>
      {/* 欢迎屏 */}
      {messages.length === 0 && !loading && (
        <WelcomeScreen onQuickPrompt={onQuickPrompt} />
      )}

      {/* 消息流 */}
      {renderItems.map((item, idx) => {
        const isLast = idx === lastItemIndex;

        if (item.kind === 'tool_group') {
          return (
            <ToolGroup
              key={item.messages[0].id}
              messages={item.messages}
              isLastGroup={isLast}
              loading={loading}
            />
          );
        }

        const msg = item.message;

        if (msg.kind === 'user') {
          return <UserBubble key={msg.id} content={msg.content} />;
        }

        if (msg.kind === 'assistant_text') {
          return <AssistantText key={msg.id} content={msg.content} streaming={msg.streaming} />;
        }

        if (msg.kind === 'plan_confirm') {
          if (msg.state === 'confirmed') {
            return (
              <div key={msg.id} style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '8px 0', color: '#52c41a', fontSize: 12 }}>
                <CheckCircleFilled style={{ fontSize: 12 }} />
                <span>已确认计划，开始创建...</span>
              </div>
            );
          }
          if (msg.state === 'cancelled') {
            return (
              <div key={msg.id} style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '8px 0', color: '#8c8c8c', fontSize: 12 }}>
                <CloseCircleFilled style={{ fontSize: 12 }} />
                <span>已取消</span>
              </div>
            );
          }
          return (
            <ConfirmPlanCard
              key={msg.id}
              plan={msg.plan}
              onConfirm={plan => onConfirmPlan(msg.id, plan)}
              onCancel={() => onCancelPlan(msg.id)}
            />
          );
        }

        if (msg.kind === 'action_confirm') {
          return <ActionConfirm key={msg.id} message={msg} />;
        }

        if (msg.kind === 'error') {
          return <ErrorRow key={msg.id} content={msg.content} />;
        }

        return null;
      })}

      {/* 初始 loading：消息为空 或 最后一条是用户消息（AI 还没有任何回复） */}
      {loading && (() => {
        if (renderItems.length === 0) return true;
        const last = renderItems[renderItems.length - 1];
        return last.kind === 'single' && last.message.kind === 'user';
      })() && <ThinkingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
