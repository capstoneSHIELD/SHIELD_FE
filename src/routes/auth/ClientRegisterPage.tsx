import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { PageHeader } from '@/components/mobile/PageHeader';
import { UnderlineField } from '@/components/mobile/UnderlineField';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { userApi } from '@/lib/userApi';
import type { PendingRegistrationState } from '@/lib/authFlow';

const schema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식을 입력해주세요'),
  phone: z
    .string()
    .min(1, '전화번호를 입력해주세요')
    .regex(/^010-\d{4}-\d{4}$/, '010-XXXX-XXXX 형식으로 입력해주세요'),
});

type FormValues = z.infer<typeof schema>;

export function ClientRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const [agreed, setAgreed] = useState(false);

  const pending = (location.state ?? null) as PendingRegistrationState | null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: pending?.name ?? '',
      email: pending?.email ?? '',
      phone: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const originalName = pending?.name?.trim() ?? '';
      const nextName = data.name.trim();
      if (nextName && nextName !== originalName) {
        await userApi.updateMe({ name: nextName });
      }
    } catch (err) {
      console.warn('[ClientRegister] 이름 업데이트 실패:', err);
    }

    if (pending?.accessToken) {
      await login(pending.accessToken);
    }

    navigate('/home', { replace: true });
  };

  const canSubmit = agreed && isValid && !isSubmitting;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-white">
      <PageHeader title="회원가입" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-1 flex-col px-6 pt-4 pb-6"
      >
        {/* Title — figma 02 (SHIELD 워드마크 #3688f4 인라인 예외) */}
        <h2 className="text-[21px] font-bold leading-8 tracking-[-0.6px]">
          <span className="text-[#3688f4]">SHIELD</span>
          <span className="text-text-primary">와 함께</span>
          <br />
          <span className="text-text-primary">법률 서비스를 사용해 볼까요?</span>
        </h2>

        {/* Form fields */}
        <div className="mt-8 flex flex-col gap-6">
          <UnderlineField
            label="이메일"
            required
            placeholder="example@shield.ai"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            register={register('email')}
          />
          <UnderlineField
            label="이름"
            required
            placeholder="홍길동"
            autoComplete="name"
            error={errors.name?.message}
            register={register('name')}
          />
          <UnderlineField
            label="휴대전화"
            required
            placeholder="010-1234-5678"
            type="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            register={register('phone')}
          />
        </div>

        {/* Terms checkbox */}
        <label className="mt-10 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 size-5 rounded-xs border border-[#565d6d] text-brand focus:ring-brand/40"
          />
          <span className="text-[14px] leading-5 text-[rgba(22,24,29,0.8)]">
            <span className="font-medium text-[#e52e2e]">* </span>
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-brand"
              onClick={(e) => e.stopPropagation()}
            >
              서비스 이용약관
            </a>
            {' 및 '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-brand"
              onClick={(e) => e.stopPropagation()}
            >
              개인정보 처리방침
            </a>
            에 동의합니다.
          </span>
        </label>

        {/* Submit — figma 02: Button lg (h-14, rounded-shape-md, shadow-btn) */}
        <div className="mt-auto pt-6">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canSubmit}
            isLoading={isSubmitting}
          >
            회원가입 완료
          </Button>
        </div>
      </form>
    </div>
  );
}
