import React from 'react';
import { ConfigProvider } from 'antd';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './consts/routes';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';

export const App: React.FC = () => {
  return (
    <ConfigProvider
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
        <Routes>
          <Route path={AppRoutes.LOGIN} element={<Login />} />
          <Route path={AppRoutes.REGISTER} element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path={AppRoutes.HOME} element={<Dashboard />} />
            <Route path={AppRoutes.PROFILE} element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to={AppRoutes.HOME} replace />} />
        </Routes>
      </AuthProvider>
    </ConfigProvider>
  );
};


export default App;
