import React, { useEffect, useState } from 'react';
import { Alert, Avatar, Button, Divider, Form, message } from 'antd';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Fingerprint, KeyRound, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AppRoutes } from '../consts/routes';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthPasswordInput, AuthTextInput } from '../components/auth/AuthInput';
import { formatAuthErrorMessage, IAuthErrorInfo } from '../utils/auth-error.utils';
import { ILastLoggedUser, passkeyService } from '../services/passkey.service';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithPasskey, isAuthenticated } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<IAuthErrorInfo | null>(null);

  const [lastUser, setLastUser] = useState<ILastLoggedUser | null>(null);
  const [usePasswordMode, setUsePasswordMode] = useState(false);
  const [isPasskeySupported, setIsPasskeySupported] = useState(false);

  useEffect(() => {
    const saved = passkeyService.getLastLoggedUser();
    setLastUser(saved);
    if (saved?.email) {
      form.setFieldsValue({ email: saved.email });
    }
    passkeyService.isSupported().then(setIsPasskeySupported);
  }, [form]);

  if (isAuthenticated) {
    return <Navigate to={AppRoutes.HOME} replace />;
  }

  const navigateToDestination = () => {
    const redirectPath =
      (location.state as { from?: { pathname?: string } })?.from?.pathname ||
      AppRoutes.HOME;
    navigate(redirectPath, { replace: true });
  };

  const handlePasskeyLogin = async (email?: string) => {
    setErrorInfo(null);
    setIsPasskeyLoading(true);

    try {
      await loginWithPasskey(email);
      message.success(t('auth.passkey.loginSuccess'));
      navigateToDestination();
    } catch (err: unknown) {
      const error = err as Error;
      if (error?.name === 'NotAllowedError') {
        message.info(
          lastUser?.hasPasskey
            ? t('auth.passkey.cancelledOrNotFound')
            : t('auth.passkey.notFoundPrompt'),
        );
      } else {
        const parsedError = formatAuthErrorMessage(err, 'login');
        setErrorInfo(parsedError);
        message.error(parsedError.title);
      }
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  const handleSubmit = async (values: { email?: string; password?: string }) => {
    setErrorInfo(null);
    setIsSubmitting(true);

    try {
      const email = values.email?.trim() || '';
      const password = values.password || '';

      await login(email, password);

      message.success(t('auth.loginSuccess'));
      navigateToDestination();
    } catch (err: unknown) {
      const parsedError = formatAuthErrorMessage(err, 'login');
      setErrorInfo(parsedError);
      message.error(parsedError.title);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchAccount = () => {
    passkeyService.clearLastLoggedUser();
    setLastUser(null);
    setUsePasswordMode(true);
    form.resetFields();
  };

  // Only show Quick FaceID Login when user has enrolled a passkey and device supports WebAuthn
  const showQuickLogin = Boolean(
    lastUser && lastUser.hasPasskey && isPasskeySupported && !usePasswordMode,
  );

  return (
    <AuthLayout
      title={
        showQuickLogin
          ? t('auth.welcomeBackTitle')
          : t('auth.loginTitle')
      }
      subtitle={
        showQuickLogin
          ? t('auth.welcomeBackSubtitle')
          : t('auth.loginSubtitle')
      }
    >
      {/* Error Alert Banner */}
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

      {showQuickLogin ? (
        /* Quick Login View for Returning Users */
        <div className="space-y-6 pt-2">
          {/* User Preview Card */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-b from-emerald-50/80 to-emerald-50/30 border border-emerald-100/80">
            <Avatar
              size={72}
              src={lastUser?.avatarUrl}
              icon={<User className="w-9 h-9 text-emerald-700" />}
              className="bg-emerald-100 text-emerald-800 border-2 border-emerald-500/20 shadow-inner mb-3"
            />
            <h3 className="text-lg font-bold text-gray-900 !mb-0.5">
              {lastUser?.displayName || lastUser?.email}
            </h3>
            <p className="text-xs text-gray-500 !mb-0 font-medium">{lastUser?.email}</p>
          </div>

          {/* Primary FaceID / Biometric Action */}
          <div className="space-y-3">
            <Button
              type="primary"
              size="large"
              icon={<Fingerprint className="w-5 h-5 text-emerald-200" />}
              loading={isPasskeyLoading}
              onClick={() => handlePasskeyLogin(lastUser?.email)}
              block
              className="!w-full !h-13 !bg-emerald-700 hover:!bg-emerald-800 active:!bg-emerald-900 !text-white !font-bold !text-base !rounded-xl !border-none shadow-lg shadow-emerald-700/25 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {t('auth.passkey.signInFaceId')}
            </Button>

            <Button
              type="default"
              size="large"
              icon={<KeyRound className="w-4 h-4 text-gray-500" />}
              onClick={() => {
                setUsePasswordMode(true);
                form.setFieldsValue({ email: lastUser?.email });
              }}
              block
              className="!w-full !h-12 !font-semibold !text-gray-700 !rounded-xl !border-gray-200 hover:!border-emerald-600 hover:!text-emerald-700 transition-colors"
            >
              {t('auth.passkey.signInPassword')}
            </Button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleSwitchAccount}
              className="text-xs font-semibold text-gray-500 hover:text-emerald-700 transition-colors focus:outline-none"
            >
              {t('auth.passkey.switchAccount')}
            </button>
          </div>
        </div>
      ) : (
        /* Standard Email & Password Form */
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
            label={<span className="text-sm font-semibold text-gray-700">{t('auth.emailLabel')}</span>}
            rules={[
              { required: true, message: t('auth.emailRequired') },
              { type: 'email', message: t('auth.emailInvalid') },
            ]}
          >
            <AuthTextInput
              placeholder={t('auth.emailPlaceholder')}
              type="email"
              autoComplete="email"
              status={errorInfo ? 'error' : undefined}
            />
          </Form.Item>

          {/* Password field with Forgot Password row */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-gray-700">{t('auth.passwordLabel')}</span>
              <button
                type="button"
                onClick={() => message.info(t('auth.forgotPasswordSoon'))}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors focus:outline-none"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
            <Form.Item
              name="password"
              noStyle
              rules={[
                { required: true, message: t('auth.passwordRequired') },
                { min: 6, message: t('auth.passwordMin') },
              ]}
            >
              <AuthPasswordInput
                placeholder="••••••••"
                autoComplete="current-password"
                status={errorInfo ? 'error' : undefined}
              />
            </Form.Item>
          </div>

          <div className="pt-3 space-y-3">
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              block
              className="!w-full !h-12 !bg-emerald-700 hover:!bg-emerald-800 active:!bg-emerald-900 !text-white !font-semibold !text-base !rounded-xl !border-none shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all duration-200"
            >
              {t('auth.loginButton')}
            </Button>

            {/* Direct FaceID button option if browser supports it */}
            {isPasskeySupported && (
              <>
                <Divider plain className="!my-2 !text-xs !text-gray-400">
                  {t('auth.or')}
                </Divider>

                <Button
                  type="default"
                  icon={<Fingerprint className="w-4 h-4 text-emerald-700" />}
                  loading={isPasskeyLoading}
                  onClick={() => handlePasskeyLogin()}
                  block
                  className="!w-full !h-11 !font-semibold !text-gray-700 !rounded-xl !border-gray-200 hover:!border-emerald-600 hover:!text-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  {t('auth.passkey.signInQuickFaceId')}
                </Button>
              </>
            )}
          </div>
        </Form>
      )}

      {/* Footer Navigation */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          {t('auth.noAccount')}{' '}
          <Link
            to={AppRoutes.REGISTER}
            className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
          >
            {t('auth.registerNow')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
