export interface User {
  id?: string;
  username?: string;
  email?: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}
