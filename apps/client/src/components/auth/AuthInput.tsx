import React, { useState } from 'react';
import { Input } from 'antd-mobile';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export interface AuthInputProps {
  id?: string;
  value?: string;
  onChange?: (val: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  disabled?: boolean;
  clearable?: boolean;
  prefixIcon?: React.ReactNode;
}

export const AuthTextInput: React.FC<AuthInputProps> = ({
  id,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  type = 'text',
  autoComplete,
  disabled,
  clearable = true,
  prefixIcon = <Mail className="w-5 h-5 text-gray-400" />,
}) => {
  return (
    <div className="flex items-center w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white border border-gray-200 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10 rounded-xl transition-all duration-200">
      {prefixIcon && (
        <div className="text-gray-400 mr-2.5 flex-shrink-0 flex items-center select-none">
          {prefixIcon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <Input
          id={id}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          type={type}
          autoComplete={autoComplete}
          disabled={disabled}
          clearable={clearable}
          className="w-full text-sm text-gray-900 bg-transparent placeholder:text-gray-400"
        />
      </div>
    </div>
  );
};

export const AuthPasswordInput: React.FC<AuthInputProps> = ({
  id,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder = '••••••••',
  autoComplete,
  disabled,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white border border-gray-200 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10 rounded-xl transition-all duration-200">
      <div className="text-gray-400 mr-2.5 flex-shrink-0 flex items-center select-none">
        <Lock className="w-5 h-5 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <Input
          id={id}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          disabled={disabled}
          className="w-full text-sm text-gray-900 bg-transparent placeholder:text-gray-400"
        />
      </div>
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        tabIndex={-1}
        className="text-gray-400 hover:text-gray-600 focus:outline-none ml-2 p-1 rounded-md transition-colors"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};
