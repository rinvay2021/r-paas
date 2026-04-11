// ── 统一消息类型 ─────────────────────────────────────────────────────────────
// 借鉴 Claude Code 的消息规范化思想：所有 SSE 事件统一转换为 NormalizedMessage，
// 渲染层只处理类型，不关心事件来源。

export type { SseEvent, SseEventType, AiConfig, ConfirmPlan, ConfirmPlanButton } from '@/api/ai/interface';

// ── 工具调用状态机 ────────────────────────────────────────────────────────────
// queued → running → success | error
// 借鉴 Claude Code 的 inProgressToolUseIDs Set 思想，但用更明确的状态枚举
export type ToolCallStatus = 'running' | 'success' | 'error';

// ── 规范化消息类型 ────────────────────────────────────────────────────────────

/** 用户输入消息 */
export interface UserMessage {
  kind: 'user';
  id: string;
  content: string;
  timestamp: number;
}

/** AI 文字消息（流式追加） */
export interface AssistantTextMessage {
  kind: 'assistant_text';
  id: string;
  content: string;
  timestamp: number;
  /** 是否是当前正在流式输出的消息 */
  streaming?: boolean;
}

/** 工具调用行（单条，借鉴 Claude Code 的 AssistantToolUseMessage） */
export interface ToolCallMessage {
  kind: 'tool_call';
  id: string;
  callId: string;         // 后端生成的唯一 ID，用于 success/error 匹配
  toolName: string;
  description: string;
  status: ToolCallStatus;
  error?: string;
  timestamp: number;
}

/** 创建计划确认卡片 */
export interface PlanConfirmMessage {
  kind: 'plan_confirm';
  id: string;
  plan: import('@/api/ai/interface').ConfirmPlan;
  state: 'pending' | 'confirmed' | 'cancelled';
  timestamp: number;
}

/** 破坏性操作确认（内联） */
export interface ActionConfirmMessage {
  kind: 'action_confirm';
  id: string;
  description: string;
  actionType: string;
  isDelete: boolean;
  state: 'pending' | 'confirmed' | 'cancelled';
  timestamp: number;
}

/** 错误消息 */
export interface ErrorMessage {
  kind: 'error';
  id: string;
  content: string;
  timestamp: number;
}

export type NormalizedMessage =
  | UserMessage
  | AssistantTextMessage
  | ToolCallMessage
  | PlanConfirmMessage
  | ActionConfirmMessage
  | ErrorMessage;

// ── 类型守卫 ──────────────────────────────────────────────────────────────────
export const isUserMsg = (m: NormalizedMessage): m is UserMessage => m.kind === 'user';
export const isAssistantText = (m: NormalizedMessage): m is AssistantTextMessage => m.kind === 'assistant_text';
export const isToolCall = (m: NormalizedMessage): m is ToolCallMessage => m.kind === 'tool_call';
export const isPlanConfirm = (m: NormalizedMessage): m is PlanConfirmMessage => m.kind === 'plan_confirm';
export const isActionConfirm = (m: NormalizedMessage): m is ActionConfirmMessage => m.kind === 'action_confirm';
export const isErrorMsg = (m: NormalizedMessage): m is ErrorMessage => m.kind === 'error';
