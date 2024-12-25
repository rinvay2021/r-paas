import qs from 'qs';
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from 'axios';
import { formatError } from './utils';
import type {
  Response,
  TokenService,
  RequestOptions,
  CreateHttpOptions,
  CustomAxiosRequestConfig,
} from './types';

const DEFAULT_OPTIONS: RequestOptions = {
  token: true,
  errorTip: true,
};

const DEFAULT_CONFIG: CreateHttpOptions = {
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  requestOptions: DEFAULT_OPTIONS,
};

class HttpRequest {
  private instance: AxiosInstance;
  private baseOptions: RequestOptions;
  private tokenService: TokenService;

  constructor(options: CreateHttpOptions, tokenService: TokenService) {
    const { baseURL, timeout, headers, requestOptions, axiosConfig } = {
      ...DEFAULT_CONFIG,
      ...options,
    };

    this.instance = axios.create({
      baseURL,
      timeout,
      headers: new AxiosHeaders(headers),
      paramsSerializer: params => qs.stringify(params, { arrayFormat: 'brackets' }),
      ...axiosConfig,
    });

    this.baseOptions = { ...DEFAULT_OPTIONS, ...requestOptions };
    this.tokenService = tokenService;
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const customConfig = config as CustomAxiosRequestConfig;
        const options = { ...this.baseOptions, ...customConfig.requestOptions };

        if (options.token) {
          const tokenInfo = this.tokenService.getToken();
          if (tokenInfo?.accessToken) {
            config.headers = config.headers || new AxiosHeaders();
            config.headers.set(
              'Authorization',
              `${tokenInfo.tokenType || 'Bearer'} ${tokenInfo.accessToken}`
            );
          }
        }

        return config;
      },
      error => Promise.reject(formatError(error))
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<Response>) => {
        const { data } = response;

        if (data.code !== 0) {
          const error = formatError({
            message: data.message,
            code: data.code,
            config: response.config,
            response,
          });

          return Promise.reject(error);
        }

        return data.data;
      },
      async error => {
        // 处理 401 未授权
        if (error.response?.status === 401) {
          if (this.tokenService.refreshToken) {
            try {
              const newToken = await this.tokenService.refreshToken();
              this.tokenService.setToken(newToken);
              // 重试失败的请求
              const config = error.config;
              return this.instance.request(config);
            } catch (refreshError) {
              this.tokenService.clearToken();
              window.location.href = '/login';
              return Promise.reject(formatError(error));
            }
          } else {
            this.tokenService.clearToken();
            window.location.href = '/login';
            return Promise.reject(formatError(error));
          }
        }

        return Promise.reject(formatError(error));
      }
    );
  }

  public request<T = any>(config: CustomAxiosRequestConfig): Promise<T> {
    return this.instance.request(config);
  }

  public get<T = any>(url: string, params?: any, options?: RequestOptions): Promise<T> {
    return this.request({ method: 'GET', url, params, requestOptions: options });
  }

  public post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request({ method: 'POST', url, data, requestOptions: options });
  }

  public put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request({ method: 'PUT', url, data, requestOptions: options });
  }

  public delete<T = any>(url: string, params?: any, options?: RequestOptions): Promise<T> {
    return this.request({ method: 'DELETE', url, params, requestOptions: options });
  }

  public patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request({ method: 'PATCH', url, data, requestOptions: options });
  }
}

export default HttpRequest;
