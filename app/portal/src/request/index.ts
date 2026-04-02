import { message } from 'antd';
import { createHttp, tokenService } from '@r-paas/shared/http';

const baseURL = 'http://localhost:8080/api/v1';

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

          if (code !== 200) {
            message.error(msg || '系统异常，请稍后重试');
          }

          return response;
        },
        onRejected: (error: any) => {
          const msg = error.response?.data?.message || error.message || '系统异常，请稍后重试';
          message.error(msg);

          return Promise.reject(error);
        },
      },
    ],
  },
};

const authHttp = createHttp({
  ...baseConfig,
  requestOptions: {
    token: false,
  },
});

const http = createHttp(baseConfig);

export { authHttp, http, tokenService };
