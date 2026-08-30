import React from 'react';
import { Button, Form, Toast } from 'antd-mobile';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AppRoutes } from '../consts/routes';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthPasswordInput, AuthTextInput } from '../components/auth/AuthInput';

export const Register: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { register, loading, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={AppRoutes.HOME} replace />;
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const email = values.email?.trim();
      const password = values.password;

      await register(email, password);

      Toast.show({
        icon: 'success',
        content: 'Account created successfully!',
        duration: 1500,
      });

      navigate(AppRoutes.HOME, { replace: true });
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
        : error?.message || 'Registration failed. Please try again.';

      Toast.show({
        icon: 'fail',
        content: errorMessage,
      });
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking expenses and managing your budget with MySpend"
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
            <span className="text-sm font-semibold text-gray-700">
              Password
            </span>
          }
          rules={[
            { required: true, message: 'Please enter a password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <AuthPasswordInput
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={
            <span className="text-sm font-semibold text-gray-700">
              Confirm Password
            </span>
          }
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('The passwords do not match')
                );
              },
            }),
          ]}
        >
          <AuthPasswordInput
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />
        </Form.Item>

        <div className="pt-2">
          <Button
            block
            type="submit"
            loading={loading}
            className="!w-full !h-12 !bg-emerald-700 hover:!bg-emerald-800 active:!bg-emerald-900 !text-white !font-semibold !text-base !rounded-xl !border-none shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all duration-200"
          >
            Create Account
          </Button>
        </div>
      </Form>

      {/* Footer Navigation */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to={AppRoutes.LOGIN}
            className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
