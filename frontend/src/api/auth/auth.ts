import request from '../axios.config';
import { saveTokens, saveUser, clearAll, getRefreshToken } from '../../utils/storage';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  LogoutRequest,
  LogoutResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
  User,
} from './auth.types';

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await request.post<LoginResponse>('/api/auth/login/', credentials);
  const { access, refresh, user } = response;
  
  saveTokens(access, refresh);
  saveUser(user);
  
  return response;
}

export async function logout(): Promise<LogoutResponse> {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    clearAll();
    throw new Error('No refresh token found');
  }

  const logoutData: LogoutRequest = { refresh: refreshToken };
  const response = await request.post<LogoutResponse>('/api/auth/logout/', logoutData);
  
  clearAll();
  
  return response;
}

export async function register(userData: RegisterRequest): Promise<RegisterResponse> {
  return await request.post<RegisterResponse>('/api/auth/register/', userData);
}

export async function refreshToken(refresh: string): Promise<TokenRefreshResponse> {
  const refreshData: TokenRefreshRequest = { refresh };
  const response = await request.post<TokenRefreshResponse>('/api/auth/refresh/', refreshData);
  
  const { access, refresh: newRefresh } = response;
  saveTokens(access, newRefresh);
  
  return response;
}

export async function getCurrentUser(): Promise<User> {
  const response = await request.get<User>('/api/auth/me/');
  saveUser(response);
  return response;
}

export * from './auth.types';
