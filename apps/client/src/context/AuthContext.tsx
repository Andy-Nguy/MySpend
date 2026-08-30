import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { apiClient } from '../services/api.service';
import { tokenStore } from '../services/tokenStore';

export interface IAuthUser {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface IAuthContextValue {
  user: IAuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface IAuthResponse {
  accessToken: string;
  user: IAuthUser;
}

const AuthContext = createContext<IAuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((session: IAuthResponse) => {
    tokenStore.setAccessToken(session.accessToken);
    setUser(session.user);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const recoverSession = async () => {
      try {
        const { data } = await apiClient.post<IAuthResponse>('/auth/refresh');

        if (isMounted) {
          applySession(data);
        }
      } catch {
        tokenStore.clearAccessToken();

        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    recoverSession();

    return () => {
      isMounted = false;
    };
  }, [applySession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await apiClient.post<IAuthResponse>('/auth/login', {
        email,
        password,
      });
      applySession(data);
    },
    [applySession]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const { data } = await apiClient.post<IAuthResponse>('/auth/register', {
        email,
        password,
      });
      applySession(data);
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout so user is always cleared locally
    } finally {
      tokenStore.clearAccessToken();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [loading, login, logout, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
