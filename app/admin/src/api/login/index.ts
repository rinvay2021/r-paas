import { authHttp, http, tokenService } from '@/request';
import type { LoginRequest, LoginResponse } from './interface';

export class AuthService {
  async login(data: LoginRequest) {
    try {
      const response = await authHttp.post<LoginResponse>('/auth/login', data);

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
