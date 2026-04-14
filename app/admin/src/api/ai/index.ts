import { http, tokenService } from '@/request';
import type { AiConfig, AiConfigSaveParams } from './interface';

const BASE_URL = '/api/v1';

export const aiApi = {
  getConfig() {
    return http.get<AiConfig>('/ai/config');
  },

  saveConfig(params: AiConfigSaveParams) {
    return http.post('/ai/config', params);
  },

  getSession(sessionId: string) {
    return http.get(`/ai/session/${sessionId}`);
  },

  /** 用户确认计划（传入可能修改后的计划） */
  confirmPlan(sessionId: string, plan: any) {
    return http.post(`/ai/confirm/${sessionId}`, { plan });
  },

  /** 用户取消计划 */
  cancelPlan(sessionId: string) {
    return http.delete(`/ai/confirm/${sessionId}`);
  },

  /** 用户确认破坏性操作 */
  confirmAction(sessionId: string) {
    return http.post(`/ai/action/${sessionId}`);
  },

  /** 用户取消破坏性操作 */
  cancelAction(sessionId: string) {
    return http.delete(`/ai/action/${sessionId}`);
  },

  /**
   * 发送消息，返回 fetch Response（用于 ReadableStream SSE）
   * 不走 axios，直接用 fetch，避免拦截器干扰 SSE 流
   */
  async chatStream(params: {
    message: string;
    sessionId?: string;
    appCode?: string;
    model?: string;
  }, signal?: AbortSignal): Promise<Response> {
    const tokenInfo = tokenService.getToken();
    return fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(tokenInfo?.accessToken ? { Authorization: `${tokenInfo.tokenType || 'Bearer'} ${tokenInfo.accessToken}` } : {}),
      },
      body: JSON.stringify(params),
      signal,
    });
  },
};
