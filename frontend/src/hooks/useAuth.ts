import { useState, useEffect } from 'react';
import { getUser, getAccessToken } from '../utils/storage';
import type { User } from '../api/auth/auth.types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = getAccessToken();
      const userData = getUser();

      if (token && userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
  };
};
