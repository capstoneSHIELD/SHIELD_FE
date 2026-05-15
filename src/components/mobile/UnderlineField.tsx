import type { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/lib/cn';

export interface UnderlineFieldProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  error?: string;
  register: UseFormRegisterReturn;
}

export function UnderlineField({
  label,
  required,
  placeholder,
  type = 'text',
  autoComplete,
  error,
  register,
}: UnderlineFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[14px] font-medium leading-5 text-[#171a1f]">
        {required && <span className="text-warning-red">* </span>}
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(
          'w-full border-b bg-transparent py-2 text-base leading-6 text-[#171a1f]',
          'placeholder:text-text-soft',
          'outline-none transition-colors',
          'focus:border-brand',
          error ? 'border-warning-red' : 'border-[#e0e2e6]',
        )}
        {...register}
      />
      {error && (
        <p className="mt-1 text-xs text-warning-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
