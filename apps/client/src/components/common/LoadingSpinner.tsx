import React from 'react';

interface ILoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  tip?: string;
  className?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<ILoadingSpinnerProps> = ({
  size = 'md',
  tip,
  className = '',
  fullScreen = false,
}) => {
  const outerSizeClass =
    size === 'sm' ? 'w-8 h-8 border-2' : size === 'lg' ? 'w-20 h-20 border-4' : 'w-14 h-14 border-[3px]';
  const innerSizeClass =
    size === 'sm' ? 'w-5 h-5 border-2' : size === 'lg' ? 'w-14 h-14 border-4' : 'w-9 h-9 border-[3px]';

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${outerSizeClass} border-transparent text-emerald-600 animate-spin flex items-center justify-center border-t-emerald-600 rounded-full`}
      >
        <div
          className={`${innerSizeClass} border-transparent text-teal-400 animate-spin flex items-center justify-center border-t-teal-400 rounded-full`}
        />
      </div>
      {tip && <p className="text-xs font-semibold text-gray-500 animate-pulse">{tip}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
