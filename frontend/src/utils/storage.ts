const TOKEN_KEYS = {
  ACCESS: 'mber_access_token',
  REFRESH: 'mber_refresh_token',
  USER: 'mber_user',
} as const;

export const saveTokens = (access: string, refresh: string): void => {
  localStorage.setItem(TOKEN_KEYS.ACCESS, access);
  localStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEYS.ACCESS);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEYS.REFRESH);
};

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
};

export const saveUser = (user: any): void => {
  localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
};

export const getUser = (): any | null => {
  const userStr = localStorage.getItem(TOKEN_KEYS.USER);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const clearUser = (): void => {
  localStorage.removeItem(TOKEN_KEYS.USER);
};

export const clearAll = (): void => {
  clearTokens();
  clearUser();
};
