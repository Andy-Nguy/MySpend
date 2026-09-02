import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PermissionNameEnum } from '@myspend/libs';
import { useAuth } from '../context/AuthContext';
import { AppRoutes } from '../consts/routes';

interface PermissionProtectedRouteProps {
  permission: PermissionNameEnum;
  children?: React.ReactNode;
}

export const PermissionProtectedRoute: React.FC<PermissionProtectedRouteProps> = ({
  permission,
  children,
}) => {
  const { user, isAuthenticated, loading, fetchMe, hasPermission } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
    }
  }, [location.pathname, isAuthenticated, fetchMe]);

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={AppRoutes.LOGIN} replace state={{ from: location }} />;
  }

  if (!hasPermission(permission)) {
    return <Navigate to={AppRoutes.HOME} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
