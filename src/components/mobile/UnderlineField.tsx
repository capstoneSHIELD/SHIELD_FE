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
      <label className="text-[14px] font-medium leading-5 text-text-primary">
        {required && <span className="text-error">* </span>}
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(
          'w-full border-b bg-transparent py-2 text-base leading-6 text-text-primary',
          'placeholder:text-text-soft',
          'outline-none transition-colors',
          'focus:border-brand',
          error ? 'border-error' : 'border-border',
        )}
        {...register}
      />
      {error && (
        <p className="mt-1 text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
