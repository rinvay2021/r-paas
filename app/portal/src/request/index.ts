import { message } from 'antd';
import { createHttp, tokenService } from '@r-paas/shared/http';

const BASE_URL = 'http://localhost:8080/api/v1';

/** 统一错误提示拦截器（只提示，不吞掉 reject） */
const errorInterceptor = {
  onRejected: (error: any) => {
    const msg: string = error?.message || '系统异常，请稍后重试';
    message.error(msg);
    return Promise.reject(error);
  },
};

/** 需要认证的 http 实例（业务接口） */
const http = createHttp({
  baseURL: BASE_URL,
  requestOptions: { token: true },
  interceptors: { response: [errorInterceptor] },
});

/** 不需要认证的 http 实例（登录等） */
const authHttp = createHttp({
  baseURL: BASE_URL,
  requestOptions: { token: false },
  interceptors: { response: [errorInterceptor] },
});

export { http, authHttp, tokenService };
