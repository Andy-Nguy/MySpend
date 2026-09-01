import React from 'react';
import { Input, InputProps } from 'antd';
import { Lock, Mail } from 'lucide-react';

export const AuthTextInput: React.FC<InputProps> = (props) => {
  return (
    <Input
      prefix={<Mail className="w-4 h-4 text-gray-400 mr-1.5 flex-shrink-0" />}
      size="large"
      className="!rounded-xl !py-2.5 !bg-slate-50 hover:!bg-slate-100/80 focus:!bg-white !border-gray-200 focus:!border-emerald-600 shadow-none transition-all duration-200"
      {...props}
    />
  );
};

export const AuthPasswordInput: React.FC<InputProps> = (props) => {
  return (
    <Input.Password
      prefix={<Lock className="w-4 h-4 text-gray-400 mr-1.5 flex-shrink-0" />}
      size="large"
      className="!rounded-xl !py-2.5 !bg-slate-50 hover:!bg-slate-100/80 focus:!bg-white !border-gray-200 focus:!border-emerald-600 shadow-none transition-all duration-200"
      {...props}
    />
  );
};
