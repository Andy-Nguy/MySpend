import React from 'react';
import { Button, Form, Toast } from 'antd-mobile';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppRoutes } from '../consts/routes';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthPasswordInput, AuthTextInput } from '../components/auth/AuthInput';

export const Login: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={AppRoutes.HOME} replace />;
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const email = values.email?.trim();
      const password = values.password;

      await login(email, password);

      Toast.show({
        icon: 'success',
        content: 'Welcome back!',
        duration: 1500,
      });

      const redirectPath =
        (location.state as { from?: { pathname?: string } })?.from?.pathname ||
        AppRoutes.HOME;
      navigate(redirectPath, { replace: true });
    } catch (err: unknown) {
      // If validation error from Form, do not show toast
      if (err && typeof err === 'object' && 'errorFields' in err) {
        return;
      }

      const error = err as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      const errorMessage = error?.response?.data?.message
        ? Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message
        : error?.message || 'Login failed. Please check your credentials.';

      Toast.show({
        icon: 'fail',
        content: errorMessage,
      });
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your email and password to access your account"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="space-y-4"
        requiredMarkStyle="none"
      >
        <Form.Item
          name="email"
          label={
            <span className="text-sm font-semibold text-gray-700">
              Email address
            </span>
          }
          rules={[
            { required: true, message: 'Please enter your email address' },
            { type: 'email', message: 'Please enter a valid email address' },
          ]}
        >
          <AuthTextInput
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-semibold text-gray-700">
                Password
              </span>
              <span
                className="text-xs font-medium text-gray-400 cursor-not-allowed select-none transition-colors"
                title="Password reset feature coming soon"
              >
                Forgot password?
              </span>
            </div>
          }
          rules={[
            { required: true, message: 'Please enter your password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <AuthPasswordInput
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </Form.Item>

        <div className="pt-2">
          <Button
            block
            type="submit"
            loading={loading}
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
