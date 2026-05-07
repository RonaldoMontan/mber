const TOKEN_KEYS = {
  ACCESS: 'mber_access_token',
  REFRESH: 'mber_refresh_token',
  USER: 'mber_user',
} as const;

export const saveTokens = (access: string, refresh: string): void => {
  try {
    if (!access || !refresh || typeof access !== 'string' || typeof refresh !== 'string') {
      console.warn('Invalid tokens provided to saveTokens');
      clearTokens();
      return;
    }
    localStorage.setItem(TOKEN_KEYS.ACCESS, access);
    localStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
  } catch (error) {
    console.error('Failed to save tokens:', error);
    clearTokens();
  }
};

export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEYS.ACCESS);
  } catch (error) {
    console.warn('Failed to read access token:', error);
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEYS.REFRESH);
  } catch (error) {
    console.warn('Failed to read refresh token:', error);
    return null;
  }
};

export const clearTokens = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
  } catch (error) {
    console.warn('Failed to clear tokens:', error);
  }
};

export const saveUser = (user: any): void => {
  try {
    if (!user || typeof user !== 'object') {
      console.warn('Invalid user provided to saveUser');
      clearUser();
      return;
    }
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user:', error);
    clearUser();
  }
};

export const getUser = (): any | null => {
  try {
    const userStr = localStorage.getItem(TOKEN_KEYS.USER);
    if (!userStr) return null;
    
    const parsed = JSON.parse(userStr);
    if (!parsed || typeof parsed !== 'object') {
      clearUser();
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn('Failed to parse stored user data, clearing cache');
    clearUser();
    return null;
  }
};

export const clearUser = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEYS.USER);
  } catch (error) {
    console.warn('Failed to clear user:', error);
  }
};

export const clearAll = (): void => {
  clearTokens();
  clearUser();
};
