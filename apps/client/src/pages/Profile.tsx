import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Typography,
} from 'antd';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Lock,
  Phone,
  ShieldCheck,
  User,
  Wallet,
} from 'lucide-react';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { AppRoutes } from '../consts/routes';
import { useAuth } from '../context/AuthContext';
import { IChangePasswordData, IUpdateProfileData, profileService } from '../services/profile.service';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';

const { Title, Text } = Typography;

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUserProfile } = useAuth();

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const isNewUser = (location.state as { isNewUser?: boolean })?.isNewUser;

  // Initialize form fields from current authenticated user
  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        displayName: user.displayName || '',
        mobileNumber: user.mobileNumber || '',
        dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null,
        avatarUrl: user.avatarUrl || '',
        initialBalance: user.initialBalance ?? 0,
        monthlyBudget: user.monthlyBudget ?? null,
      });
    }
  }, [user, profileForm]);

  const handleUpdateProfile = async (values: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    mobileNumber?: string;
    dateOfBirth?: dayjs.Dayjs | null;
    avatarUrl?: string;
    initialBalance?: number;
    monthlyBudget?: number;
  }) => {
    setIsUpdatingProfile(true);

    try {
      const payload: IUpdateProfileData = {
        firstName: values.firstName?.trim() || undefined,
        lastName: values.lastName?.trim() || undefined,
        displayName: values.displayName?.trim() || undefined,
        mobileNumber: values.mobileNumber?.trim() || undefined,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined,
        avatarUrl: values.avatarUrl?.trim() || undefined,
        initialBalance: values.initialBalance !== undefined ? Number(values.initialBalance) : undefined,
        monthlyBudget: values.monthlyBudget !== undefined && values.monthlyBudget !== null ? Number(values.monthlyBudget) : undefined,
      };

      const updated = await profileService.updateProfile(payload);
      updateUserProfile(updated);

      if (isNewUser) {
        message.success(t('profile.updateSuccess'));
        navigate(AppRoutes.HOME, { replace: true });
      } else {
        message.success(t('profile.updateSuccess'));
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } }; message?: string };
      const errorMessage = error?.response?.data?.message
        ? Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message
        : error?.message || 'Failed to update profile';

      message.error(errorMessage);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (values: IChangePasswordData) => {
    setIsChangingPassword(true);

    try {
      await profileService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      message.success(t('profile.passwordChangeSuccess'));
      passwordForm.resetFields();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } }; message?: string };
      const errorMessage = error?.response?.data?.message
        ? Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message
        : error?.message || 'Failed to change password';

      message.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-16">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 transition-all">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(AppRoutes.HOME)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100/80 text-gray-700 text-sm font-semibold transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-700" />
            <span>{isNewUser ? t('common.cancel') : t('nav.dashboard')}</span>
          </button>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <span className="text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {isNewUser ? t('profile.welcomeNewUser') : t('profile.title')}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* First Time Registration Welcome Alert Banner */}
        {isNewUser && (
          <Alert
            message={t('profile.welcomeNewUser')}
            description={t('profile.welcomeNewUserDesc')}
            type="success"
            showIcon
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            className="!rounded-2xl !border-emerald-200 !bg-emerald-50/80 shadow-sm"
          />
        )}

        {/* Profile Card Header Info */}
        <Card className="!rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6 p-2">
            <Avatar
              size={80}
              src={user?.avatarUrl}
              icon={<User className="w-10 h-10 text-emerald-700" />}
              className="bg-emerald-100 text-emerald-800 border-2 border-emerald-500/20 shadow-inner flex-shrink-0"
            />
            <div className="text-center sm:text-left space-y-1">
              <Title level={4} className="!mb-0 !text-gray-900 !font-bold">
                {user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email}
              </Title>
              <Text type="secondary" className="text-sm block">
                {user?.email}
              </Text>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Account
              </span>
            </div>
          </div>
        </Card>

        {/* Form 1: Personal Details */}
        <Card
          title={
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base py-1">
              <User className="w-5 h-5 text-emerald-700" />
              <span>{t('profile.personalInfo')}</span>
            </div>
          }
          className="!rounded-2xl shadow-sm border border-gray-200/80"
        >
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleUpdateProfile}
            requiredMark={false}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                name="firstName"
                label={<span className="text-sm font-semibold text-gray-700">{t('profile.firstName')}</span>}
              >
                <Input placeholder="e.g. John" size="large" className="!rounded-xl" />
              </Form.Item>

              <Form.Item
                name="lastName"
                label={<span className="text-sm font-semibold text-gray-700">{t('profile.lastName')}</span>}
              >
                <Input placeholder="e.g. Doe" size="large" className="!rounded-xl" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                name="displayName"
                label={<span className="text-sm font-semibold text-gray-700">{t('profile.displayName')}</span>}
              >
                <Input placeholder="e.g. Johnny" size="large" className="!rounded-xl" />
              </Form.Item>

              <Form.Item
                name="mobileNumber"
                label={<span className="text-sm font-semibold text-gray-700">{t('profile.mobileNumber')}</span>}
                rules={[{ pattern: /^\+?[0-9\s-]{8,20}$/, message: 'Please enter a valid phone number' }]}
              >
                <Input
                  prefix={<Phone className="w-4 h-4 text-gray-400 mr-1" />}
                  placeholder="+84 912 345 678"
                  size="large"
                  className="!rounded-xl"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                name="dateOfBirth"
                label={<span className="text-sm font-semibold text-gray-700">{t('profile.dateOfBirth')}</span>}
              >
                <DatePicker
                  className="w-full !rounded-xl"
                  size="large"
                  suffixIcon={<Calendar className="w-4 h-4 text-gray-400" />}
                  placeholder="YYYY-MM-DD"
                  format="YYYY-MM-DD"
                />
              </Form.Item>

              <Form.Item
                name="avatarUrl"
                label={<span className="text-sm font-semibold text-gray-700">{t('profile.avatarUrl')}</span>}
                rules={[{ type: 'url', message: 'Please enter a valid image URL' }]}
              >
                <Input placeholder="https://example.com/avatar.jpg" size="large" className="!rounded-xl" />
              </Form.Item>
            </div>

            <Form.Item
              name="email"
              label={
                <span className="text-sm font-semibold text-gray-700">
                  {t('profile.email')} <span className="text-gray-400 font-normal">{t('profile.emailReadonly')}</span>
                </span>
              }
            >
              <Input size="large" disabled className="!rounded-xl !bg-gray-100 !text-gray-500" />
            </Form.Item>

            <div className="pt-3 pb-1 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-4 h-4 text-emerald-700" />
                <span className="text-sm font-bold text-gray-800">{t('profile.financialSettings')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item
                  name="initialBalance"
                  label={
                    <div>
                      <span className="text-sm font-semibold text-gray-700">{t('profile.startingBalance')}</span>
                      <p className="text-xs text-gray-400 font-normal">{t('profile.startingBalanceDesc')}</p>
                    </div>
                  }
                >
                  <InputNumber
                    className="w-full !rounded-xl"
                    size="large"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => (value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0)}
                    placeholder="e.g. 5,000,000"
                    addonAfter="₫"
                  />
                </Form.Item>

                <Form.Item
                  name="monthlyBudget"
                  label={
                    <div>
                      <span className="text-sm font-semibold text-gray-700">{t('profile.monthlyBudget')}</span>
                      <p className="text-xs text-gray-400 font-normal">{t('profile.monthlyBudgetDesc')}</p>
                    </div>
                  }
                >
                  <InputNumber
                    className="w-full !rounded-xl"
                    size="large"
                    min={0}
                    formatter={(value) => (value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                    parser={(value) => (value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0)}
                    placeholder="e.g. 10,000,000"
                    addonAfter="₫"
                  />
                </Form.Item>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdatingProfile}
                className="!bg-emerald-700 hover:!bg-emerald-800 !h-11 !px-8 !font-semibold !rounded-xl border-none shadow-md shadow-emerald-700/20"
              >
                {isNewUser ? t('profile.saveAndContinue') : t('profile.saveChanges')}
              </Button>
            </div>
          </Form>
        </Card>

        {/* Form 2: Security & Change Password (Only shown for existing users) */}
        {!isNewUser && (
          <Card
            title={
              <div className="flex items-center gap-2 text-gray-900 font-bold text-base py-1">
                <Lock className="w-5 h-5 text-emerald-700" />
                <span>{t('profile.security')}</span>
              </div>
            }
            className="!rounded-2xl shadow-sm border border-gray-200/80"
          >
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
              requiredMark={false}
            >
              <Form.Item
                name="currentPassword"
                label={<span className="text-sm font-semibold text-gray-700">{t('profile.currentPassword')}</span>}
                rules={[{ required: true, message: 'Please enter your current password' }]}
              >
                <Input.Password
                  placeholder="••••••••"
                  size="large"
                  className="!rounded-xl"
                />
              </Form.Item>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item
                  name="newPassword"
                  label={<span className="text-sm font-semibold text-gray-700">{t('profile.newPassword')}</span>}
                  rules={[
                    { required: true, message: 'Please enter a new password' },
                    { min: 6, message: 'Password must be at least 6 characters' },
                  ]}
                >
                  <Input.Password
                    placeholder="At least 6 characters"
                    size="large"
                    className="!rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmNewPassword"
                  label={<span className="text-sm font-semibold text-gray-700">{t('profile.confirmNewPassword')}</span>}
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Please confirm your new password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error(t('profile.passwordMismatch')));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    placeholder="Re-enter new password"
                    size="large"
                    className="!rounded-xl"
                  />
                </Form.Item>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isChangingPassword}
                  className="!bg-emerald-700 hover:!bg-emerald-800 !h-11 !px-8 !font-semibold !rounded-xl border-none shadow-md shadow-emerald-700/20"
                >
                  {t('profile.saveChanges')}
                </Button>
              </div>
            </Form>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Profile;
