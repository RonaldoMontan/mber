import { useState, useEffect } from 'react';
import { getUser, getAccessToken, clearAll } from '../utils/storage';
import { getCurrentUser } from '../api/auth';
import type { User } from '../api/auth/auth.types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const token = getAccessToken();
      const userData = getUser();

      if (!token) {
        clearAll();
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      if (userData && isMounted) {
        setUser(userData);
      }

      try {
        const currentUser = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        setUser(currentUser);
        setIsAuthenticated(true);
      } catch {
        if (!isMounted) {
          return;
        }

        clearAll();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
  };
};
