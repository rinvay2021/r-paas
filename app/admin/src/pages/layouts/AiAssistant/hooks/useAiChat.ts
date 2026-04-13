import React from 'react';
// @ts-expect-error: nanoid 是纯 ESM 包，但在 CommonJS 环境下通过 require 引入会有类型冲突，但运行时通常没问题
import { nanoid } from 'nanoid';
import { aiApi } from '@/api/ai';
import { useAiConfig } from './useAiConfig';
import type { SseEvent, ConfirmPlan } from '@/api/ai/interface';
import type {
  NormalizedMessage,
  AssistantTextMessage,
  ToolCallMessage,
  PlanConfirmMessage,
  ActionConfirmMessage,
} from '../types';

// ── localStorage ──────────────────────────────────────────────────────────────
const LS_SESSION_KEY = 'ai_session_id';
const LS_MESSAGES_KEY = 'ai_chat_messages';

function readLocalSession(): { sessionId?: string; messages: NormalizedMessage[] } {
  try {
    const sessionId = localStorage.getItem(LS_SESSION_KEY) || undefined;
    const raw = localStorage.getItem(LS_MESSAGES_KEY);
    const messages: NormalizedMessage[] = raw ? JSON.parse(raw) : [];
    return { sessionId, messages };
  } catch {
    return { sessionId: undefined, messages: [] };
  }
}

function saveLocalSession(sessionId: string | undefined, messages: NormalizedMessage[]) {
  try {
    if (sessionId) localStorage.setItem(LS_SESSION_KEY, sessionId);
    else localStorage.removeItem(LS_SESSION_KEY);
    // 将 running 状态的工具调用改为 error（防止恢复时永久 loading）
    const toSave = messages.slice(-100).map(m =>
      m.kind === 'tool_call' && m.status === 'running'
        ? { ...m, status: 'error' as const, error: '已中断' }
        : m
    );
    localStorage.setItem(LS_MESSAGES_KEY, JSON.stringify(toSave));
  } catch { /* localStorage 满了，忽略 */ }
}

function clearLocalSession() {
  localStorage.removeItem(LS_SESSION_KEY);
  localStorage.removeItem(LS_MESSAGES_KEY);
}

// ── 从后端消息历史恢复（只恢复 user/assistant 文字） ─────────────────────────
function restoreFromBackend(backendMessages: any[]): NormalizedMessage[] {
  const result: NormalizedMessage[] = [];
  for (const m of backendMessages) {
    if (m.role === 'user' && typeof m.content === 'string' && m.content.trim()) {
      result.push({ kind: 'user', id: nanoid(), content: m.content, timestamp: Date.now() });
    } else if (m.role === 'assistant' && typeof m.content === 'string' && m.content.trim()) {
      result.push({ kind: 'assistant_text', id: nanoid(), content: m.content, timestamp: Date.now() });
    }
  }
  return result;
}

// ── SSE chunk 解析 ────────────────────────────────────────────────────────────
function parseSseChunk(chunk: string): SseEvent[] {
  const events: SseEvent[] = [];
  for (const line of chunk.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    const json = line.slice(6).trim();
    if (!json) continue;
    try { events.push(JSON.parse(json)); } catch { /* ignore */ }
  }
  return events;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAiChat() {
  const local = React.useMemo(() => readLocalSession(), []);
  const { config: aiConfig } = useAiConfig();

  const [messages, setMessages] = React.useState<NormalizedMessage[]>(local.messages);
  const [sessionId, setSessionId] = React.useState<string | undefined>(local.sessionId);
  const [loading, setLoading] = React.useState(false);
  const [selectedModel, setSelectedModel] = React.useState('');
  const [restoring, setRestoring] = React.useState(false);

  const abortRef = React.useRef<AbortController | null>(null);
  const bufferRef = React.useRef('');

  // 从配置读取默认模型
  React.useEffect(() => {
    if (aiConfig?.defaultModel && !selectedModel) {
      setSelectedModel(aiConfig.defaultModel);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiConfig?.defaultModel]);

  // 持久化
  React.useEffect(() => {
    if (!loading) saveLocalSession(sessionId, messages);
  }, [messages, sessionId, loading]);

  // 初始化时验证 session
  React.useEffect(() => {
    if (!local.sessionId) return;
    setRestoring(true);
    aiApi.getSession(local.sessionId)
      .then((res: any) => {
        const data = res?.data;
        if (!data) { clearLocalSession(); setMessages([]); setSessionId(undefined); return; }
        if (local.messages.length === 0 && data.messages?.length > 0) {
          const restored = restoreFromBackend(data.messages);
          if (restored.length > 0) setMessages(restored);
        }
      })
      .catch(() => { /* 网络错误，保留本地缓存 */ })
      .finally(() => setRestoring(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 消息更新工具函数 ────────────────────────────────────────────────────────

  /** 追加一条新消息 */
  const appendMsg = (msg: NormalizedMessage) =>
    setMessages(prev => [...prev, msg]);

  /** 更新最后一条 assistant_text（流式追加内容） */
  const appendToLastText = (content: string) =>
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.kind === 'assistant_text') {
        return [...prev.slice(0, -1), { ...last, content: last.content + content }];
      }
      // 没有 assistant_text，新建一条
      return [...prev, {
        kind: 'assistant_text', id: nanoid(), content, timestamp: Date.now(), streaming: true,
      } as AssistantTextMessage];
    });

  /** 标记最后一条 assistant_text 流式结束 */
  const finalizeLastText = () =>
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.kind === 'assistant_text' && last.streaming) {
        return [...prev.slice(0, -1), { ...last, streaming: false }];
      }
      return prev;
    });

  /** 更新工具调用状态（通过 callId 匹配） */
  const updateToolCall = (callId: string, update: Partial<ToolCallMessage>) =>
    setMessages(prev => prev.map(m =>
      m.kind === 'tool_call' && m.callId === callId ? { ...m, ...update } : m
    ));

  /** 更新计划确认卡片状态 */
  const updatePlanConfirm = (id: string, state: PlanConfirmMessage['state']) =>
    setMessages(prev => prev.map(m =>
      m.kind === 'plan_confirm' && m.id === id ? { ...m, state } : m
    ));

  // ── SSE 事件处理 ────────────────────────────────────────────────────────────
  const handleSseEvent = async (event: SseEvent) => {
    switch (event.type) {

      case 'thinking':
        // 不插入任何消息，只用于触发 loading 状态感知
        // 借鉴 Claude Code：不用占位消息，loading 状态由 loading flag 驱动
        break;

      case 'message':
        if (event.data.sessionId && !sessionId) {
          setSessionId(event.data.sessionId);
        } else if (event.data.content) {
          appendToLastText(event.data.content);
        }
        break;

      case 'clarify_required': {
        const questions = event.data.questions || '请描述一下你想做什么？';
        appendMsg({ kind: 'assistant_text', id: nanoid(), content: questions, timestamp: Date.now() });
        break;
      }

      case 'tool_start': {
        const toolName = event.data.toolName || '';
        const description = event.data.description || toolName;
        const callId = event.data.sessionId || nanoid();
        appendMsg({
          kind: 'tool_call', id: nanoid(), callId, toolName, description,
          status: 'running', timestamp: Date.now(),
        } as ToolCallMessage);
        break;
      }

      case 'tool_success': {
        const callId = event.data.sessionId || '';
        if (callId) updateToolCall(callId, { status: 'success' });
        break;
      }

      case 'tool_error': {
        const callId = event.data.sessionId || '';
        if (callId) updateToolCall(callId, { status: 'error', error: event.data.error });
        break;
      }

      case 'preview_required': {
        if (!event.data.plan) break;
        const planMsgId = nanoid();
        if (event.data.sessionId) setSessionId(event.data.sessionId);
        appendMsg({
          kind: 'plan_confirm', id: planMsgId,
          plan: event.data.plan!, state: 'pending', timestamp: Date.now(),
        } as PlanConfirmMessage);
        break;
      }

      case 'confirm_action': {
        const actionDesc = event.data.actionDescription || '此操作';
        const actionType = event.data.actionType || '';
        const sid = event.data.sessionId || sessionId;
        const isDelete = actionType.startsWith('delete_');
        const confirmMsgId = nanoid();

        appendMsg({
          kind: 'action_confirm', id: confirmMsgId,
          description: actionDesc, actionType, isDelete, state: 'pending', timestamp: Date.now(),
        } as ActionConfirmMessage);

        // 阻塞等待用户操作
        await new Promise<void>(resolve => {
          (window as any)[`__actionConfirm_${confirmMsgId}`] = async (confirmed: boolean) => {
            delete (window as any)[`__actionConfirm_${confirmMsgId}`];
            setMessages(prev => prev.map(m =>
              m.kind === 'action_confirm' && m.id === confirmMsgId
                ? { ...m, state: confirmed ? 'confirmed' : 'cancelled' } as ActionConfirmMessage
                : m
            ));
            if (confirmed) { if (sid) await aiApi.confirmAction(sid).catch(() => {}); }
            else { if (sid) await aiApi.cancelAction(sid).catch(() => {}); }
            resolve();
          };
        });
        break;
      }

      case 'complete':
        if (event.data.sessionId) setSessionId(event.data.sessionId);
        finalizeLastText();
        break;

      case 'error':
        finalizeLastText();
        appendMsg({
          kind: 'error', id: nanoid(),
          content: event.data.error || '发生未知错误', timestamp: Date.now(),
        });
        break;
    }
  };

  // ── 发送消息 ────────────────────────────────────────────────────────────────
  const sendMessage = async (text: string, appCode?: string) => {
    if (!text.trim() || loading) return;

    appendMsg({ kind: 'user', id: nanoid(), content: text, timestamp: Date.now() });
    setLoading(true);
    abortRef.current = new AbortController();
    bufferRef.current = '';

    try {
      const response = await aiApi.chatStream(
        { message: text, sessionId, appCode, model: selectedModel || undefined },
        abortRef.current.signal,
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bufferRef.current += decoder.decode(value, { stream: true });
        const parts = bufferRef.current.split('\n\n');
        bufferRef.current = parts.pop() || '';
        for (const part of parts) {
          for (const e of parseSseChunk(part)) await handleSseEvent(e);
        }
      }
      if (bufferRef.current) {
        for (const e of parseSseChunk(bufferRef.current)) await handleSseEvent(e);
        bufferRef.current = '';
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        finalizeLastText();
        appendMsg({ kind: 'error', id: nanoid(), content: `请求失败：${e.message}`, timestamp: Date.now() });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── 确认 / 取消计划 ─────────────────────────────────────────────────────────
  const confirmPlan = async (msgId: string, plan: ConfirmPlan) => {
    if (!sessionId) return;
    updatePlanConfirm(msgId, 'confirmed');
    setLoading(true);
    try { await aiApi.confirmPlan(sessionId, plan); } catch { /* 拦截器处理 */ }
  };

  const cancelPlan = async (msgId: string) => {
    if (!sessionId) return;
    updatePlanConfirm(msgId, 'cancelled');
    appendMsg({ kind: 'assistant_text', id: nanoid(), content: '已取消。如需重新创建，请重新描述需求。', timestamp: Date.now() });
    setLoading(false);
    abortRef.current?.abort();
    try { await aiApi.cancelPlan(sessionId); } catch { /* 拦截器处理 */ }
  };

  // ── 中断 / 重置 ─────────────────────────────────────────────────────────────
  const interrupt = () => {
    abortRef.current?.abort();
    setLoading(false);
    finalizeLastText();
    appendMsg({ kind: 'assistant_text', id: nanoid(), content: '⏹ 已中断。', timestamp: Date.now() });
  };

  const reset = () => {
    setMessages([]);
    setSessionId(undefined);
    setLoading(false);
    bufferRef.current = '';
    clearLocalSession();
  };

  return {
    messages, loading, restoring,
    selectedModel, setSelectedModel,
    sendMessage, reset, sessionId,
    confirmPlan, cancelPlan, interrupt,
  };
}
