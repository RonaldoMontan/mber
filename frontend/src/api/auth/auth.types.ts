export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  groups: string[];
  is_active: boolean;
  date_joined: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  refresh: string;
  access: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  password: string;
  password2: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  groups?: string[];
}

export interface RegisterResponse {
  user: User;
  message: string;
}

export interface LogoutRequest {
  refresh: string;
}

export interface LogoutResponse {
  message: string;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
  refresh: string;
}
