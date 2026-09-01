import React, { useState } from 'react';
import { Alert, Button, Form, message } from 'antd';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { AppRoutes } from '../consts/routes';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthPasswordInput, AuthTextInput } from '../components/auth/AuthInput';
import { formatAuthErrorMessage, IAuthErrorInfo } from '../utils/auth-error.utils';

export const Login: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorInfo, setErrorInfo] = useState<IAuthErrorInfo | null>(null);

  if (isAuthenticated) {
    return <Navigate to={AppRoutes.HOME} replace />;
  }

  const handleSubmit = async (values: { email?: string; password?: string }) => {
    setErrorInfo(null);
    setIsSubmitting(true);

    try {
      const email = values.email?.trim() || '';
      const password = values.password || '';

      await login(email, password);

      message.success('Signed in successfully!');

      const redirectPath =
        (location.state as { from?: { pathname?: string } })?.from?.pathname ||
        AppRoutes.HOME;
      navigate(redirectPath, { replace: true });
    } catch (err: unknown) {
      const parsedError = formatAuthErrorMessage(err, 'login');
      setErrorInfo(parsedError);
      message.error(parsedError.title);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your email and password to access your account"
    >
      {/* Human-Readable Error Alert Banner */}
      {errorInfo && (
        <Alert
          message={<span className="font-bold text-red-900">{errorInfo.title}</span>}
          description={<span className="text-sm text-red-700/90">{errorInfo.description}</span>}
          type="error"
          showIcon
          closable
          onClose={() => setErrorInfo(null)}
          className="mb-5 !rounded-xl border-red-200/80 bg-red-50/90 shadow-sm"
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={() => setErrorInfo(null)}
        className="space-y-4"
        requiredMark={false}
      >
        <Form.Item
          name="email"
          label={<span className="text-sm font-semibold text-gray-700">Email address</span>}
          rules={[
            { required: true, message: 'Please enter your email address' },
            { type: 'email', message: 'Please enter a valid email address' },
          ]}
        >
          <AuthTextInput
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            status={errorInfo ? 'error' : undefined}
          />
        </Form.Item>

        {/* Custom Password Label Row to prevent text overlap */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-gray-700">Password</span>
            <button
              type="button"
              onClick={() => message.info('Password reset feature will be available soon!')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors focus:outline-none"
            >
              Forgot password?
            </button>
          </div>
          <Form.Item
            name="password"
            noStyle
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <AuthPasswordInput
              placeholder="••••••••"
              autoComplete="current-password"
              status={errorInfo ? 'error' : undefined}
            />
          </Form.Item>
        </div>

        <div className="pt-3">
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            block
            className="!w-full !h-12 !bg-emerald-700 hover:!bg-emerald-800 active:!bg-emerald-900 !text-white !font-semibold !text-base !rounded-xl !border-none shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all duration-200"
          >
            Sign in
          </Button>
        </div>
      </Form>

      {/* Footer Navigation */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            to={AppRoutes.REGISTER}
            className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
