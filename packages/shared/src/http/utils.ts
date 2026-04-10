import type { AxiosError } from 'axios';
import type { RequestError } from './types';

export const isAxiosError = (error: any): error is AxiosError => {
  return error != null && error.isAxiosError === true;
};

/**
 * 将任意错误统一格式化为 RequestError。
 * 注意：BusinessError（由默认响应拦截器创建）已包含正确的 message，直接透传。
 */
export const formatError = (error: unknown): RequestError => {
  // BusinessError：默认拦截器创建，message 已是业务文本
  if (error instanceof Error && (error as any).name === 'BusinessError') {
    return error as RequestError;
  }

  if (isAxiosError(error)) {
    // 优先取响应体中的业务 message，其次取 axios 自身的 message
    const businessMessage = (error.response?.data as { message?: string } | undefined)?.message;
    return Object.assign(new Error(businessMessage || error.message || '请求失败'), {
      name: 'RequestError',
      code: error.response?.status,
      config: error.config,
      response: error.response,
    }) as RequestError;
  }

  if (error instanceof Error) {
    return error as RequestError;
  }

  return Object.assign(new Error('未知错误'), { name: 'UnknownError' }) as RequestError;
};
