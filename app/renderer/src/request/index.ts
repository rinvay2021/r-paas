import { message } from 'antd';
import { createHttp } from '@r-paas/shared/http';

const BASE_URL = 'http://localhost:8080/api/v1';

const http = createHttp({
  baseURL: BASE_URL,
  requestOptions: { token: false },
  interceptors: {
    response: [
      {
        onRejected: (error: any) => {
          const msg: string = error?.message || '系统异常，请稍后重试';
          message.error(msg);
          return Promise.reject(error);
        },
      },
    ],
  },
});

export { http, BASE_URL };
