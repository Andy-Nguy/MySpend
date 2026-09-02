import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { IProfile, PermissionNameEnum, UserRoleEnum } from '@myspend/libs';
import { AUTH_UNAUTHORIZED_EVENT, apiClient } from '../services/api.service';
import { tokenStore } from '../services/tokenStore';

export interface IAuthUser extends IProfile {
  id: string;
  email: string;
  role: UserRoleEnum;
  permissions?: PermissionNameEnum[];
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  mobileNumber?: string | null;
  dateOfBirth?: Date | string | null;
  avatarUrl?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface IAuthContextValue {
  user: IAuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updatedUser: Partial<IAuthUser>) => void;
  fetchMe: () => Promise<IAuthUser | null>;
  hasPermission: (permission: PermissionNameEnum) => boolean;
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

  const updateUserProfile = useCallback((updatedUser: Partial<IAuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await apiClient.get<IAuthUser>('/auth/me');
      setUser(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  const hasPermission = useCallback(
    (permission: PermissionNameEnum) => {
      return user?.permissions?.includes(permission) ?? false;
    },
    [user]
  );

  useEffect(() => {
    const handleUnauthorized = () => {
      tokenStore.clearAccessToken();
      setUser(null);
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const recoverSession = async () => {
      try {
        const { data } = await apiClient.post<IAuthResponse>('/auth/refresh');

        if (isMounted) {
          applySession(data);
          // Sync fresh profile & permissions from DB via /auth/me
          try {
            const meRes = await apiClient.get<IAuthUser>('/auth/me');
            if (isMounted) {
              setUser(meRes.data);
            }
          } catch {
            // keep session from refresh
          }
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
      updateUserProfile,
      fetchMe,
      hasPermission,
    }),
    [loading, login, logout, register, updateUserProfile, fetchMe, hasPermission, user]
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
