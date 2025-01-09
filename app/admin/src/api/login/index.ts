import http, { createHttp, tokenService } from '@r-paas/shared/http';
import type { LoginRequest, LoginResponse } from './interface';
// 不需要 token 的 HTTP 实例用于登录
const authHttp = createHttp({
  baseURL: 'http://localhost:8080',
  requestOptions: {
    token: false,
  },
});

export class AuthService {
  async login(data: LoginRequest) {
    try {
      const response = await authHttp.post<LoginResponse>('/api/v1/auth/login', data);

      tokenService.setToken({
        accessToken: response.data.token,
      });

      return response.data.user;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await http.post('/auth/logout');
    } finally {
      tokenService.clearToken();
    }
  }
}

export default new AuthService();
export type { LoginRequest, LoginResponse };
