import type { TokenInfo, TokenService } from './types';

const TOKEN_KEY = 'auth_token';

class LocalTokenService implements TokenService {
  getToken(): TokenInfo | null {
    const tokenStr = localStorage.getItem(TOKEN_KEY);
    if (!tokenStr) return null;

    try {
      return JSON.parse(tokenStr);
    } catch {
      return null;
    }
  }

  setToken(token: TokenInfo): void {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export default new LocalTokenService();
