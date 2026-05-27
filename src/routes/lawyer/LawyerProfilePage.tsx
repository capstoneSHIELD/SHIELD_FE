import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronRight, FileText, LogOut, Shield, Upload } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/stores/authStore';
import { useMyLawyerProfile } from '@/hooks/useLawyer';
import { lawyerApi } from '@/lib/lawyerApi';
import { Spinner, SpecializationPicker } from '@/components/ui';
import { ProfileImageUploader } from '@/components/profile/ProfileImageUploader';
import { LawyerCard, LawyerHeader, LawyerPage } from '@/components/lawyer/LawyerChrome';
import type { VerificationStatus } from '@/types/enums';

const schema = z.object({
  specializations: z.array(z.string()).min(1, '전문분야를 1개 이상 선택해주세요'),
  experienceYears: z.number({ error: '경력을 입력해주세요' }).min(0, '경력은 0년 이상이어야 합니다'),
  bio: z.string(),
});

type FormValues = z.infer<typeof schema>;

const VERIFICATION_LABEL: Record<VerificationStatus, { text: string; className: string }> = {
  VERIFIED: { text: '승인 완료', className: 'bg-green-50 text-green-700' },
  PENDING: { text: '인증 대기', className: 'bg-yellow-50 text-yellow-700' },
  REVIEWING: { text: '심사 중', className: 'bg-info-bg text-brand' },
  SUPPLEMENT_REQUESTED: { text: '보완 요청', className: 'bg-red-50 text-red-600' },
  REJECTED: { text: '인증 거부', className: 'bg-red-50 text-red-600' },
};

function SectionTitle({ children }: { children: string }) {
  return <h2 className="px-1 text-[12px] font-medium text-[#334e86]">{children}</h2>;
}

function FieldBox({ children }: { children: string }) {
  return (
    <div className="rounded-card border border-gray-200 bg-white px-[13px] py-[11px] text-[13px] text-[#111827]">
      {children}
    </div>
  );
}

export function LawyerProfilePage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useMyLawyerProfile();
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      specializations: [],
      experienceYears: 0,
      bio: '',
    },
  });

  const selectedSpecs = useWatch({ control, name: 'specializations' }) ?? [];

  useEffect(() => {
    if (profile) {
      reset({
        specializations: profile.domains ?? [],
        experienceYears: profile.experienceYears ?? 0,
        bio: profile.bio ?? '',
      });
    }
  }, [profile, reset]);

  function syncProfileImageUrl(newUrl: string | null) {
    queryClient.invalidateQueries({ queryKey: ['lawyers', 'me'] });
    if (user) {
      setUser({ ...user, profileImageUrl: newUrl ?? undefined });
    }
  }

  async function onSubmit(values: FormValues) {
    if (!profile) return;
    await lawyerApi.updateMe({
      domains: values.specializations,
      subDomains: profile.subDomains ?? [],
      experienceYears: values.experienceYears,
      certifications: profile.certifications ?? [],
      tags: profile.tags ?? [],
      bio: values.bio,
      region: profile.region ?? '',
    });
    await queryClient.invalidateQueries({ queryKey: ['lawyers', 'me'] });
    setSuccessMessage('프로필이 저장되었습니다.');
    setTimeout(() => setSuccessMessage(''), 2000);
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  if (isLoading) {
    return (
      <LawyerPage>
        <LawyerHeader title="내 프로필" />
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </LawyerPage>
    );
  }

  const displayName = profile?.name ?? user?.name ?? '변호사';
  const verification = profile?.verificationStatus
    ? VERIFICATION_LABEL[profile.verificationStatus]
    : null;
  const primaryDomain = profile?.domains?.[0] ?? '전문분야 미설정';

  return (
    <LawyerPage>
      <LawyerHeader title="내 프로필" />

      <main className="flex-1 px-4 py-4 pb-28">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {successMessage && (
            <div className="rounded-card border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm font-medium text-green-700">{successMessage}</p>
            </div>
          )}

          <LawyerCard className="px-4 py-5">
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <ProfileImageUploader
                  currentUrl={profile?.profileImageUrl ?? null}
                  name={displayName}
                  size={72}
                  onUploaded={(url) => syncProfileImageUrl(url)}
                  onDeleted={() => syncProfileImageUrl(null)}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="truncate text-[17px] font-semibold text-[#111827]">
                  {displayName} 변호사
                </p>
                <p className="truncate text-xs text-gray-500">{primaryDomain}</p>
                {verification && (
                  <span className={cn('inline-flex rounded-full px-2.5 py-[3px] text-[10px] font-medium', verification.className)}>
                    {verification.text}
                  </span>
                )}
              </div>
            </div>
          </LawyerCard>

          <section className="space-y-3">
            <SectionTitle>기본 정보</SectionTitle>
            <LawyerCard className="space-y-2 p-3.5">
              <FieldBox>{profile?.name ?? displayName}</FieldBox>
              <FieldBox>{user?.email ?? '-'}</FieldBox>
            </LawyerCard>
          </section>

          <section className="space-y-3">
            <SectionTitle>전문 분야</SectionTitle>
            <LawyerCard className="p-3.5">
              <SpecializationPicker
                value={selectedSpecs}
                onChange={(value) => setValue('specializations', value, { shouldValidate: true })}
                error={errors.specializations?.message}
              />
            </LawyerCard>
          </section>

          <section className="space-y-3">
            <SectionTitle>경력</SectionTitle>
            <LawyerCard className="p-3.5">
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min={0}
                  className={cn(
                    'h-11 w-20 rounded-card border bg-white px-[13px] text-[13px] text-[#111827]',
                    'outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30',
                    errors.experienceYears ? 'border-red-500' : 'border-gray-200',
                  )}
                  {...register('experienceYears', { valueAsNumber: true })}
                />
                <span className="text-sm font-medium text-[#111827]">년</span>
              </div>
              {errors.experienceYears && (
                <p className="mt-2 text-xs text-red-500" role="alert">
                  {errors.experienceYears.message}
                </p>
              )}
            </LawyerCard>
          </section>

          <section className="space-y-3">
            <SectionTitle>소개</SectionTitle>
            <LawyerCard className="p-3.5">
              <textarea
                rows={6}
                placeholder="소개를 입력해주세요."
                className="min-h-28 w-full resize-none rounded-card border border-gray-200 bg-white px-[13px] py-[11px] text-[13px] leading-relaxed text-[#111827] outline-none transition-colors placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/30"
                {...register('bio')}
              />
            </LawyerCard>
          </section>

          <section className="space-y-3">
            <SectionTitle>자격 증명 서류</SectionTitle>
            <LawyerCard className="space-y-3 p-3.5">
              {profile?.certifications && profile.certifications.length > 0 && (
                <div className="space-y-2">
                  {profile.certifications.map((certification) => (
                    <div
                      key={certification}
                      className="rounded-card border border-gray-100 bg-gray-50 px-3 py-2 text-[13px] font-medium text-[#111827]"
                    >
                      {certification}
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => navigate('/lawyer/documents')}
                className="flex min-h-20 w-full items-center justify-center gap-3 rounded-card border border-dashed border-brand/40 bg-white text-[12px] font-semibold text-brand transition-colors hover:bg-info-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-info-bg">
                  <Upload size={18} strokeWidth={1.8} aria-hidden="true" />
                </span>
                서류 업로드
              </button>
            </LawyerCard>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'flex h-14 w-full items-center justify-center rounded-card bg-brand text-base font-bold text-white shadow-lg shadow-brand/20',
              'transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
              isSubmitting && 'cursor-not-allowed opacity-60',
            )}
          >
            {isSubmitting ? '저장 중...' : '저장하기'}
          </button>

          <LawyerCard className="overflow-hidden">
            {[
              { label: '인증 관리', icon: Shield, to: '/lawyer/verification' },
              { label: '서류 관리', icon: FileText, to: '/lawyer/documents' },
            ].map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.to)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-gray-50',
                  index > 0 && 'border-t border-gray-100',
                )}
              >
                <span className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-info-bg text-brand">
                    <item.icon size={17} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-[#111827]">{item.label}</span>
                </span>
                <ChevronRight size={18} strokeWidth={1.8} className="text-gray-400" aria-hidden="true" />
              </button>
            ))}
          </LawyerCard>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-card bg-red-500 text-base font-bold text-white shadow-lg shadow-red-200 transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
          >
            <LogOut size={18} strokeWidth={2} aria-hidden="true" />
            로그아웃
          </button>
        </form>
      </main>
    </LawyerPage>
  );
}
