import http, { createHttp, tokenService } from '@r-paas/shared/http';

// 创建一个不需要 token 的 HTTP 实例用于登录
const authHttp = createHttp({
  baseURL: '/api',
  requestOptions: {
    token: false,
  },
});

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export class AuthService {
  async login(username: string, password: string) {
    try {
      const response = await authHttp.post<LoginResponse>('/auth/login', {
        username,
        password,
      });

      tokenService.setToken({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
        tokenType: response.tokenType,
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      // 使用带 token 的实例发送登出请求
      await http.post('/auth/logout');
    } finally {
      // 清除 token
      tokenService.clearToken();
    }
  }

  // 获取用户信息（示例受保护的 API）
  async getUserProfile() {
    // 这个请求会自动带上 token
    return http.get('/user/profile');
  }
}

export default new AuthService();
