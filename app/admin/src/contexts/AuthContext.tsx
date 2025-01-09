import React from 'react';
import AuthService, { LoginRequest } from '@/api/login';
import Storage, { StorageType } from '@r-paas/shared/storage';

const storage = new Storage({
  prefix: 'auth',
  storage: StorageType.LOCAL,
});

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  login: (params: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(() => {
    return !!storage.get('isAuthenticated');
  });

  const login = React.useCallback(async (params: LoginRequest) => {
    try {
      const response = await AuthService.login(params);

      if (response) {
        storage.set('user', response);
        storage.set('isAuthenticated', true);

        setIsAuthenticated(true);
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = React.useCallback(() => {
    setIsAuthenticated(false);
    storage.remove('isAuthenticated');

    AuthService.logout();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        user: storage.get('user'),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
