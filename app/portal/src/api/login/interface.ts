export interface User {
  id?: string;
  role?: string;
  username?: string;
  email?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
