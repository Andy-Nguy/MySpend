import React, { useState } from 'react';
import { Alert, Button, Form, message } from 'antd';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { AppRoutes } from '../consts/routes';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthPasswordInput, AuthTextInput } from '../components/auth/AuthInput';
import { formatAuthErrorMessage, IAuthErrorInfo } from '../utils/auth-error.utils';

export const Register: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

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

      await register(email, password);

      message.success('Account created successfully!');

      navigate(AppRoutes.PROFILE, { replace: true, state: { isNewUser: true } });
    } catch (err: unknown) {
      const parsedError = formatAuthErrorMessage(err, 'register');
      setErrorInfo(parsedError);
      message.error(parsedError.title);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking expenses and managing your budget with MySpend"
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

        <Form.Item
          name="password"
          label={<span className="text-sm font-semibold text-gray-700">Password</span>}
          rules={[
            { required: true, message: 'Please enter a password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <AuthPasswordInput
            placeholder="At least 6 characters"
            autoComplete="new-password"
            status={errorInfo ? 'error' : undefined}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={<span className="text-sm font-semibold text-gray-700">Confirm Password</span>}
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords do not match'));
              },
            }),
          ]}
        >
          <AuthPasswordInput
            placeholder="Re-enter your password"
            autoComplete="new-password"
            status={errorInfo ? 'error' : undefined}
          />
        </Form.Item>

        <div className="pt-2">
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            block
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
