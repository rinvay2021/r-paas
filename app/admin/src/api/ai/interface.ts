export type SseEventType = 'thinking' | 'message' | 'clarify_required' | 'tool_start' | 'tool_success' | 'tool_error' | 'preview_required' | 'confirm_action' | 'complete' | 'error';

export interface ConfirmPlanField {
  fieldCode: string;
  fieldName: string;
  fieldType: string;
  fieldDesc?: string;
  config?: any;
}

export interface ConfirmPlanButton {
  buttonName: string;
  buttonCode: string;
  buttonLevel: string;
  buttonEvent: string;
  buttonOrder: number;
  buttonConfig?: any;
  userSpecified: boolean;
}

export interface ConfirmPlan {
  objectName: string;
  objectCode: string;
  appCode: string;
  fields: ConfirmPlanField[];
  buttons: ConfirmPlanButton[];
  createMenu: boolean;
  menuName?: string;
  userSpecified: {
    buttons?: boolean;
    menu?: boolean;
    fields?: boolean;
  };
}

export interface SseEvent {
  type: SseEventType;
  data: {
    content?: string;
    questions?: string;       // clarify_required：需要用户回答的问题
    toolName?: string;
    description?: string;
    toolParams?: Record<string, any>;
    result?: any;
    error?: string;
    plan?: ConfirmPlan;
    // confirm_action
    actionDescription?: string;
    actionType?: string;
    summary?: { created: Array<{ type: string; name: string; code: string }> };
    sessionId?: string;
    timestamp?: number;
  };
}

export interface AiConfig {
  configured: boolean;
  provider?: string;
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  enabled?: boolean;
  modelOptions?: Record<string, { label: string; models: string[]; baseUrl: string }>;
}

export interface AiConfigSaveParams {
  provider: string;
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  enabled?: boolean;
}

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ToolItem {
  id: string;
  toolName: string;
  description: string;
  status: 'loading' | 'success' | 'error';
  result?: any;
  error?: string;
  timestamp: number;
}
