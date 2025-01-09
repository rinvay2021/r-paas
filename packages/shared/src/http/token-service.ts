import type { TokenInfo, TokenService } from './types';
import Storage, { StorageType } from '../storage';

const TOKEN_KEY = 'auth-token';

const storage = new Storage({
  prefix: 'auth',
  storage: StorageType.LOCAL,
});

class LocalTokenService implements TokenService {
  getToken(): TokenInfo | null {
    const tokenStr = storage.get(TOKEN_KEY);
    if (!tokenStr) return null;

    try {
      return JSON.parse(tokenStr as string);
    } catch {
      return null;
    }
  }

  setToken(token: TokenInfo): void {
    storage.set(TOKEN_KEY, JSON.stringify(token));
  }

  clearToken(): void {
    storage.remove(TOKEN_KEY);
  }
}

export default new LocalTokenService();
