import qs from 'qs';
import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  AxiosHeaders,
} from 'axios';
import { formatError } from './utils';
import type {
  TokenService,
  RequestOptions,
  CreateHttpOptions,
  CustomAxiosRequestConfig,
  IResponse,
  HttpInterceptors,
} from './types';

const DEFAULT_OPTIONS: RequestOptions = {
  token: true,
  errorTip: true,
};

const DEFAULT_CONFIG: CreateHttpOptions = {
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  requestOptions: DEFAULT_OPTIONS,
};

class HttpRequest {
  private readonly instance: AxiosInstance;
  private readonly baseOptions: RequestOptions;
  private readonly tokenService: TokenService;

  constructor(options: CreateHttpOptions, tokenService: TokenService) {
    const merged = { ...DEFAULT_CONFIG, ...options };

    this.instance = axios.create({
      baseURL: merged.baseURL,
      timeout: merged.timeout,
      headers: new AxiosHeaders(merged.headers),
      paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
      ...merged.axiosConfig,
    });

    this.baseOptions = { ...DEFAULT_OPTIONS, ...merged.requestOptions };
    this.tokenService = tokenService;
    this.setupInterceptors(options.interceptors);
  }

  private setupInterceptors(custom?: HttpInterceptors): void {
    // ── 请求拦截器 ──────────────────────────────────────────

    // 自定义请求拦截器（先注册先执行）
    custom?.request?.forEach((interceptor) => {
      this.instance.interceptors.request.use(interceptor.onFulfilled, interceptor.onRejected);
    });

    // 默认请求拦截器：附加 token，处理 FormData Content-Type
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const customConfig = config as CustomAxiosRequestConfig;
        const options = { ...this.baseOptions, ...customConfig.requestOptions };

        // 附加 Authorization
        if (options.token) {
          const tokenInfo = this.tokenService.getToken();
          if (tokenInfo?.accessToken) {
            config.headers ??= new AxiosHeaders();
            config.headers.set('Authorization', `${tokenInfo.tokenType ?? 'Bearer'} ${tokenInfo.accessToken}`);
          }
        }

        // FormData 时删除默认 Content-Type，让浏览器自动设置含 boundary 的值
        if (config.data instanceof FormData) {
          config.headers ??= new AxiosHeaders();
          config.headers.delete('Content-Type');
        }

        return config;
      },
      (error) => Promise.reject(formatError(error)),
    );

    // ── 响应拦截器 ──────────────────────────────────────────

    // 自定义响应拦截器（先注册先执行）
    custom?.response?.forEach((interceptor) => {
      this.instance.interceptors.response.use(interceptor.onFulfilled, interceptor.onRejected);
    });

    // 默认响应拦截器：统一处理业务 code 和 HTTP 错误
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // blob / arraybuffer 直接透传，不做业务 code 检查
        if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
          return response as any;
        }

        const body = response.data as { code: number; data: any; message: string };

        if (body.code !== 200) {
          return Promise.reject(
            Object.assign(new Error(body.message || '系统异常'), {
              name: 'BusinessError',
              code: body.code,
              config: response.config,
              response,
            }),
          );
        }

        // 返回解包后的业务数据，调用方直接拿 res.data
        return {
          code: body.code,
          data: body.data,
          message: body.message,
          success: true,
        } as IResponse<any>;
      },
      async (error) => {
        // 401：尝试刷新 token，失败则跳登录
        if (error.response?.status === 401) {
          if (this.tokenService.refreshToken) {
            try {
              const newToken = await this.tokenService.refreshToken();
              this.tokenService.setToken(newToken);
              return this.instance.request(error.config);
            } catch {
              this.tokenService.clearToken();
              window.location.href = '/login';
            }
          } else {
            this.tokenService.clearToken();
            window.location.href = '/login';
          }
        }

        return Promise.reject(formatError(error));
      },
    );
  }

  /** 通用请求 */
  public request<T = any>(config: CustomAxiosRequestConfig): Promise<IResponse<T>> {
    return this.instance.request(config);
  }

  public get<T = any>(url: string, params?: any, options?: RequestOptions): Promise<IResponse<T>> {
    return this.request<T>({ method: 'GET', url, params, requestOptions: options });
  }

  public post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<IResponse<T>> {
    return this.request<T>({ method: 'POST', url, data, requestOptions: options });
  }

  public put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<IResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data, requestOptions: options });
  }

  public patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<IResponse<T>> {
    return this.request<T>({ method: 'PATCH', url, data, requestOptions: options });
  }

  public delete<T = any>(url: string, params?: any, options?: RequestOptions): Promise<IResponse<T>> {
    return this.request<T>({ method: 'DELETE', url, params, requestOptions: options });
  }

  /**
   * 上传文件（FormData），自动处理 Content-Type boundary。
   * 返回解包后的业务数据。
   */
  public upload<T = any>(url: string, formData: FormData, options?: RequestOptions): Promise<IResponse<T>> {
    return this.request<T>({ method: 'POST', url, data: formData, requestOptions: options });
  }

  /**
   * 下载文件，返回完整 axios response（含 headers 和 blob data）。
   * 调用方通过 res.data 取 Blob，res.headers 取响应头。
   */
  public download(url: string, data?: any, options?: RequestOptions): Promise<AxiosResponse<Blob>> {
    return this.instance.request({
      method: 'POST',
      url,
      data,
      responseType: 'blob',
      requestOptions: options,
    } as any);
  }
}

export default HttpRequest;
