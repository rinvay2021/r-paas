import { message } from 'antd';
import { createHttp, tokenService } from '@r-paas/shared/http';

const baseURL = '/api/v1';

// 基础配置
const baseConfig = {
  baseURL,
  requestOptions: {
    token: true,
  },
  interceptors: {
    response: [
      {
        onFulfilled: (response: any) => {
          const { code, message: msg } = response.data;

          // 处理业务错误
          if (code !== 200) {
            message.error(msg || '系统异常，请稍后重试');
          }

          return response;
        },
        onRejected: (error: any) => {
          // 处理 HTTP 错误
          const msg = error.response?.data?.message || error.message || '系统异常，请稍后重试';
          message.error(msg);

          return Promise.reject(error);
        },
      },
    ],
  },
};

// 不需要 token 的 HTTP 实例
const authHttp = createHttp({
  ...baseConfig,
  requestOptions: {
    token: false,
  },
});

// 需要 token 的 HTTP 实例
const http = createHttp(baseConfig);

export { authHttp, http, tokenService };
