import { useState, type ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Clock, Search, AlertCircle, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { getApiErrorMessage } from '@/lib/apiError';
import { VERIFICATION_STATUS_UI } from '@/lib/constants';
import { useVerificationStatus, useRequestVerification } from '@/hooks/useLawyer';
import { Button, Spinner } from '@/components/ui';
import { LawyerCard, LawyerErrorState, LawyerHeader, LawyerPage } from '@/components/lawyer/LawyerChrome';
import type { VerificationStatus } from '@/types';

// ─── status config ────────────────────────────────────────────────────────────

interface StatusConfig {
  description: string;
  icon: ReactNode;
}

const STATUS_CONFIG: Record<VerificationStatus, StatusConfig> = {
  PENDING: {
    description: '인증 신청이 접수되었습니다. 심사 결과를 기다려 주세요.',
    icon: <Clock size={24} className="text-yellow-500" />,
  },
  REVIEWING: {
    description: '제출하신 서류를 검토 중입니다. 조금만 기다려 주세요.',
    icon: <Search size={24} className="text-brand" />,
  },
  VERIFIED: {
    description: '변호사 인증이 완료되었습니다.',
    icon: <ShieldCheck size={24} className="text-green-500" />,
  },
  REJECTED: {
    description: '인증 신청이 반려되었습니다. 사유를 확인 후 재신청해 주세요.',
    icon: <AlertCircle size={24} className="text-red-500" />,
  },
  SUPPLEMENT_REQUESTED: {
    description: '추가 서류 제출이 필요합니다. 서류 관리 페이지에서 제출해 주세요.',
    icon: <PlusCircle size={24} className="text-orange-500" />,
  },
};

// ─── page ────────────────────────────────────────────────────────────────────

export function VerificationPage() {
  const navigate = useNavigate();
  const { data: verification, isLoading, isError, error } = useVerificationStatus();
  const requestVerification = useRequestVerification();
  const [applied, setApplied] = useState(false);
  const [barAssociationNumber, setBarAssociationNumber] = useState('');
  const [isBarNumberDirty, setIsBarNumberDirty] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [requestError, setRequestError] = useState('');

  const verificationStatus = verification?.verificationStatus;
  const visibleBarAssociationNumber = isBarNumberDirty
    ? barAssociationNumber
    : verification?.barAssociationNumber ?? '';

  async function handleApply() {
    const trimmed = visibleBarAssociationNumber.trim();
    setFieldError('');
    setRequestError('');

    if (!trimmed) {
      setFieldError('대한변호사협회 등록번호를 입력해주세요.');
      return;
    }

    try {
      await requestVerification.mutateAsync({ barAssociationNumber: trimmed });
      setApplied(true);
    } catch (err) {
      setRequestError(getApiErrorMessage(err, '검증 신청에 실패했습니다.'));
    }
  }

  const config = verificationStatus ? STATUS_CONFIG[verificationStatus] : null;
  const statusUi = verificationStatus ? VERIFICATION_STATUS_UI[verificationStatus] : null;

  // Statuses that already have an active application
  const hasActiveApplication =
    verificationStatus === 'PENDING' ||
    verificationStatus === 'REVIEWING' ||
    verificationStatus === 'VERIFIED' ||
    verificationStatus === 'SUPPLEMENT_REQUESTED';

  const canApply = !hasActiveApplication || (verificationStatus as string) === 'REJECTED';

  return (
    <LawyerPage>
      <LawyerHeader title="인증 신청" showBack onBack={() => navigate(-1)} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4 pb-24 lg:py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" text="인증 상태를 불러오는 중..." />
          </div>
        ) : isError ? (
          <LawyerErrorState description={getApiErrorMessage(error, '인증 상태를 불러오지 못했습니다.')} />
        ) : (
          <div className="space-y-4">
            {/* Current status card */}
            {config && statusUi && (
              <LawyerCard
                className={cn(
                  'border p-5',
                  statusUi.bgClassName,
                  statusUi.borderClassName,
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-base font-semibold', statusUi.textClassName)}>
                      {statusUi.label}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {config.description}
                    </p>
                    {verification?.rejectionReason && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        반려 사유: {verification.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              </LawyerCard>
            )}

            {/* Apply button */}
            {canApply && !applied && (
              <LawyerCard className="space-y-4 p-5">
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {verificationStatus === 'REJECTED'
                    ? '반려 사유를 확인 후 재신청할 수 있습니다.'
                    : '변호사 인증을 신청하면 의뢰인에게 인증 변호사로 표시됩니다.'}
                </p>
                <div className="space-y-1.5">
                  <label htmlFor="bar-association-number" className="text-sm font-medium text-[#1E293B]">
                    대한변호사협회 등록번호
                  </label>
                  <input
                    id="bar-association-number"
                    type="text"
                    value={visibleBarAssociationNumber}
                    onChange={(event) => {
                      setIsBarNumberDirty(true);
                      setBarAssociationNumber(event.target.value);
                      setFieldError('');
                    }}
                    placeholder="예: 2024-12345"
                    className={cn(
                      'h-11 w-full rounded-card border bg-white px-3 text-sm text-[#111827]',
                      'outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30',
                      fieldError ? 'border-red-500' : 'border-gray-200',
                    )}
                    aria-invalid={Boolean(fieldError)}
                    aria-describedby={fieldError ? 'bar-association-number-error' : undefined}
                  />
                  {fieldError && (
                    <p id="bar-association-number-error" className="text-xs text-red-500" role="alert">
                      {fieldError}
                    </p>
                  )}
                </div>
                {requestError && (
                  <p className="rounded-card bg-red-50 px-3 py-2 text-xs font-medium text-red-600" role="alert">
                    {requestError}
                  </p>
                )}
                <Button
                  variant="primary"
                  fullWidth
                  isLoading={requestVerification.isPending}
                  onClick={handleApply}
                  leftIcon={<ShieldCheck size={16} />}
                >
                  인증 신청하기
                </Button>
              </LawyerCard>
            )}

            {/* Applied success message */}
            {applied && (
              <div className="rounded-card border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm text-green-700 font-medium">
                  인증 신청이 접수되었습니다.
                </p>
              </div>
            )}

            {/* Document link */}
            <LawyerCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">서류 제출</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    인증에 필요한 서류를 제출해 주세요
                  </p>
                </div>
                <Link
                  to="/lawyer/documents"
                  className={cn(
                    'inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium',
                    'bg-brand text-white hover:brightness-95 active:brightness-90',
                    'transition-colors duration-150',
                  )}
                >
                  서류 제출
                </Link>
              </div>
            </LawyerCard>
          </div>
        )}
      </main>
    </LawyerPage>
  );
}
