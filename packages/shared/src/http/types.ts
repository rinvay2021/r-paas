import type {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  RawAxiosRequestHeaders,
} from 'axios';

export interface RequestOptions {
  token?: boolean;
  errorTip?: boolean;
}

export interface Response<T = any> {
  code: number;
  data: T;
  message: string;
}

export interface RequestError extends Error {
  code?: number;
  config?: AxiosRequestConfig;
  response?: AxiosResponse;
}

export interface CustomAxiosRequestConfig extends Omit<InternalAxiosRequestConfig, 'headers'> {
  headers?: RawAxiosRequestHeaders;
  requestOptions?: RequestOptions;
}

// Token 相关类型定义
export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

export interface TokenService {
  getToken: () => TokenInfo | null;
  setToken: (token: TokenInfo) => void;
  clearToken: () => void;
  refreshToken?: () => Promise<TokenInfo>;
}

// 新增 HTTP 配置类型
export interface HttpConfig extends AxiosRequestConfig {
  requestOptions?: RequestOptions;
}

// 新增拦截器配置类型
export interface InterceptorHandler<T = any> {
  onFulfilled?: (value: T) => T | Promise<T>;
  onRejected?: (error: any) => any;
}

export interface HttpInterceptors {
  request?: InterceptorHandler<InternalAxiosRequestConfig>[];
  response?: InterceptorHandler<AxiosResponse>[];
}

// 新增默认配置类型
export interface CreateHttpOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  requestOptions?: RequestOptions;
  axiosConfig?: AxiosRequestConfig;
  interceptors?: HttpInterceptors;
}

export interface IResponse<T = any> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}

export type {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  RawAxiosRequestHeaders,
};
