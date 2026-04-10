import type {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  RawAxiosRequestHeaders,
} from 'axios';

/** 每次请求的可选参数 */
export interface RequestOptions {
  /** 是否附加 Authorization header，默认跟随实例配置 */
  token?: boolean;
  /** 是否由拦截器统一弹出错误提示，默认 true */
  errorTip?: boolean;
}

/** 业务/网络错误统一格式 */
export interface RequestError extends Error {
  /** HTTP 状态码或业务 code */
  code?: number;
  config?: AxiosRequestConfig;
  response?: AxiosResponse;
}

/** 扩展 axios config，携带自定义请求选项 */
export interface CustomAxiosRequestConfig extends Omit<InternalAxiosRequestConfig, 'headers'> {
  headers?: RawAxiosRequestHeaders;
  requestOptions?: RequestOptions;
}

/** Token 信息 */
export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

/** Token 管理服务接口 */
export interface TokenService {
  getToken: () => TokenInfo | null;
  setToken: (token: TokenInfo) => void;
  clearToken: () => void;
  refreshToken?: () => Promise<TokenInfo>;
}

/** 拦截器处理器 */
export interface InterceptorHandler<T = any> {
  onFulfilled?: (value: T) => T | Promise<T>;
  onRejected?: (error: any) => any;
}

/** 拦截器配置 */
export interface HttpInterceptors {
  request?: InterceptorHandler<InternalAxiosRequestConfig>[];
  response?: InterceptorHandler<AxiosResponse>[];
}

/** 创建 HTTP 实例的配置 */
export interface CreateHttpOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  requestOptions?: RequestOptions;
  axiosConfig?: AxiosRequestConfig;
  interceptors?: HttpInterceptors;
}

/** 统一业务响应格式（拦截器处理后） */
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
