import React, { useMemo } from 'react';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import enUS from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PermissionNameEnum } from '@myspend/libs';
import './locales/i18n';

import { ProtectedRoute } from './components/ProtectedRoute';
import { PermissionProtectedRoute } from './components/PermissionProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './consts/routes';
import { WhatsNewModal } from './components/announcements/WhatsNewModal';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { CategoriesPage } from './pages/Categories';
import { TransactionHistoryPage } from './pages/TransactionHistory';
import { ReportsPage } from './pages/Reports';
import { AdminAnnouncementsPage } from './pages/AdminAnnouncements';

export const App: React.FC = () => {
  const { i18n } = useTranslation();
  const antdLocale = useMemo(() => {
    return i18n.language?.startsWith('en') ? enUS : viVN;
  }, [i18n.language]);

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        token: {
          colorPrimary: '#047857',
          borderRadius: 8,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
      }}
    >
      <AuthProvider>
        <WhatsNewModal />
        <Routes>
          <Route path={AppRoutes.LOGIN} element={<Login />} />
          <Route path={AppRoutes.REGISTER} element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path={AppRoutes.HOME} element={<Dashboard />} />
            <Route path={AppRoutes.PROFILE} element={<Profile />} />
            <Route path={AppRoutes.CATEGORIES} element={<CategoriesPage />} />
            <Route path={AppRoutes.TRANSACTIONS} element={<TransactionHistoryPage />} />
            <Route path={AppRoutes.REPORTS} element={<ReportsPage />} />
            <Route
              path={AppRoutes.ADMIN_ANNOUNCEMENTS}
              element={
                <PermissionProtectedRoute permission={PermissionNameEnum.ANNOUNCEMENT_CREATE}>
                  <AdminAnnouncementsPage />
                </PermissionProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to={AppRoutes.HOME} replace />} />
        </Routes>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
