import type { AxiosError } from 'axios';
import type { RequestError } from './types';

export const isAxiosError = (error: any): error is AxiosError => {
  return error && error.isAxiosError === true;
};

export const formatError = (error: unknown): RequestError => {
  if (isAxiosError(error)) {
    return {
      name: 'RequestError',
      message:
        (error.response?.data as { message?: string })?.message ||
        (error instanceof Error ? error.message : '未知错误'),
      code: error.response?.status,
      config: error.config,
      response: error.response,
    };
  }
  if (error instanceof Error) {
    return {
      name: error.name || 'Error',
      message: error.message,
    };
  }
  return {
    name: 'UnknownError',
    message: '未知错误',
  };
};

export const getBaseUrl = () => {
  return '/api';
};
