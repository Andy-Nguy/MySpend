import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { AppRoutes } from '../consts/routes';

import { LoadingSpinner } from './common/LoadingSpinner';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading, fetchMe } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
    }
  }, [location.pathname, isAuthenticated, fetchMe]);

  if (loading) {
    return <LoadingSpinner size="lg" fullScreen tip="Đang tải dữ liệu..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={AppRoutes.LOGIN} replace state={{ from: location }} />;
  }

  return <Outlet />;
};
