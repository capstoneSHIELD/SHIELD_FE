import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Info, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { usePolling } from '@/hooks/usePolling';
import { consultationApi } from '@/lib/consultationApi';
import { getDomainMeta } from '@/lib/domainIcons';
import { Button } from '@/components/ui';
import { PageHeader } from '@/components/mobile/PageHeader';
import { DomainSelectModal } from '@/components/client/DomainSelectModal';
import type { ConsultationResponse } from '@/types/consultation';

import loaderCircle from '@/assets/figma/processing-case/loader-circle.svg';
import shieldCheck from '@/assets/figma/processing-case/shield-check.svg';

// ─── page ────────────────────────────────────────────────────────────────────

export function AnalyzingPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [timedOut, setTimedOut] = useState(false);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [classificationResult, setClassificationResult] = useState<ConsultationResponse | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isUpdatingDomain, setIsUpdatingDomain] = useState(false);
  const [domainUpdateError, setDomainUpdateError] = useState<string | null>(null);

  // ── 사용자가 분야를 직접 재선택했을 때 처리 ───────────────────────────────
  const handleDomainOverride = useCallback(
    async (domainId: string) => {
      if (!id || !classificationResult) return;
      setIsUpdatingDomain(true);
      setDomainUpdateError(null);
      try {
        const subDomains = classificationResult.aiSubDomains ?? classificationResult.userSubDomains ?? [];
        const tags = classificationResult.aiTags ?? classificationResult.userTags ?? [];
        await consultationApi.updateClassify(id, {
          domains: [domainId],
          subDomains,
          tags,
        });
        setPickerOpen(false);
        navigate('/briefs', { replace: true });
      } catch {
        setDomainUpdateError('분야 변경에 실패했습니다. 다시 시도해 주세요.');
      } finally {
        setIsUpdatingDomain(false);
      }
    },
    [id, classificationResult, navigate],
  );

  // ── elapsed timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (classificationResult) return;
    const start = Date.now();
    const timer = setInterval(() => {
      setElapsedSecs(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [classificationResult]);

  // ── navigate on complete → show classification result ───────────────────
  const handleComplete = useCallback(
    (data: ConsultationResponse) => {
      if (data.status !== 'ANALYZING') {
        setClassificationResult(data);
      }
    },
    [],
  );

  const handleTimeout = useCallback(() => {
    setTimedOut(true);
  }, []);

  // ── polling ─────────────────────────────────────────────────────────────
  usePolling<ConsultationResponse>({
    fn: () => consultationApi.getById(id).then((r) => r.data.data),
    interval: 5000,
    maxDuration: 60000,
    enabled: !!id && !timedOut,
    shouldStop: (data) => data.status !== 'ANALYZING',
    onComplete: handleComplete,
    onTimeout: handleTimeout,
  });

  function handleRetry() {
    setTimedOut(false);
    setElapsedSecs(0);
  }

  // ── classification result view (figma 06) ────────────────────────────────
  if (classificationResult) {
    const domains = classificationResult.aiDomains ?? classificationResult.userDomains ?? [];
    const primaryDomain = domains[0] ?? '';
    const meta = getDomainMeta(primaryDomain);
    const tags: string[] = classificationResult.aiTags ?? classificationResult.userTags ?? [];

    return (
      <div className="mx-auto flex h-full w-full max-w-[390px] flex-col bg-white">
        <PageHeader title="분류 결과" onBack={() => navigate(`/consultations/${id}`)} />

        <main className="flex flex-1 flex-col overflow-y-auto px-[20px] pt-[19px] pb-32">
          {/* Title — figma 06 */}
          <h2 className="text-[20px] font-bold leading-[30px] text-[#181b20]">
            사건 분류가 <span className="text-brand">완료</span>되었습니다
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-soft">
            입력하신 내용을 바탕으로 AI가 가장 유사한 법률 분야를 선정했습니다. 결과를 확인해 주세요.
          </p>

          {/* Big result card */}
          <div className="mt-6 flex flex-col items-center rounded-[10px] bg-[#d8ebfd] px-6 pt-8 pb-7 shadow-[0px_8px_16px_0px_rgba(23,25,28,0.1)]">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[12px] bg-brand/10">
              <meta.Icon
                size={40}
                strokeWidth={1.75}
                className="text-brand"
                aria-hidden="true"
              />
            </div>
            <p className="mt-5 text-sm font-medium text-brand/70">AI가 분석한 주요 분야</p>
            <p className="mt-1 text-[36px] font-bold leading-[40px] tracking-[-0.9px] text-[#0680f9]">
              {meta.label}
            </p>
            {tags.length > 0 && (
              <div className="mt-7 flex flex-wrap justify-center gap-2">
                {tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[12px] bg-white/80 px-3 py-1 text-xs font-medium text-brand"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Warning bar — figma 06 (bg-[#fef6f6] border-[#fad3d3] text-alert) */}
          <div className="mt-4 flex items-start gap-2 rounded-[12px] border border-[#fad3d3] bg-[#fef6f6] px-4 py-2.5">
            <Info size={20} className="shrink-0 text-alert" />
            <p className="text-[10px] leading-5 text-alert">
              AI의 분석은 틀릴 수 있습니다. 다른 법률 분야를 선택하시겠습니까?
            </p>
          </div>

          {domainUpdateError && (
            <div className="mt-3 rounded-lg bg-red-50 px-3 py-2">
              <p className="text-center text-xs text-red-600">{domainUpdateError}</p>
            </div>
          )}

          <div className="flex-1" />
        </main>

        {/* Bottom action area (sticky, backdrop blur — figma 06) */}
        <div className="sticky bottom-0 left-0 right-0 z-10 mx-auto w-full max-w-[390px] bg-white/80 backdrop-blur-[6px] pt-5 pb-6">
          <div className="px-[25px]">
            <button
              type="button"
              onClick={() => navigate('/briefs', { replace: true })}
              className={cn(
                'flex h-[52px] w-full items-center justify-center rounded-[12px]',
                'bg-brand text-base font-bold text-white',
                'shadow-[0px_4px_8px_0px_rgba(37,140,244,0.2)]',
                'transition duration-150 hover:brightness-95 active:scale-[0.99]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
              )}
            >
              확인
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className={cn(
                'mt-3 flex h-[52px] w-full items-center justify-center rounded-[12px]',
                'border border-[#dee1e6] bg-white text-base font-bold text-black',
                'transition duration-150 hover:bg-gray-50 active:scale-[0.99]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
              )}
            >
              다른 분야 선택
            </button>
          </div>
        </div>

        {pickerOpen && (
          <DomainSelectModal
            current={primaryDomain}
            onConfirm={handleDomainOverride}
            onClose={() => !isUpdatingDomain && setPickerOpen(false)}
          />
        )}
      </div>
    );
  }

  // ── loading state (figma 07) ─────────────────────────────────────────────
  return (
    <div className="mx-auto flex h-full w-full max-w-[390px] flex-col bg-white">
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        {timedOut ? (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <RefreshCw size={36} className="text-red-400" />
            </div>
            <div className="mt-6 space-y-1.5">
              <p className="text-base font-semibold text-gray-800">시간이 초과되었습니다</p>
              <p className="text-sm text-gray-500">새로고침해주세요.</p>
            </div>
            <Button
              variant="primary"
              size="md"
              leftIcon={<RefreshCw size={16} />}
              onClick={handleRetry}
              className="mt-6"
            >
              다시 시도
            </Button>
          </>
        ) : (
          <>
            {/* Loader circle composition — figma 07 */}
            <div className="relative flex h-24 w-24 items-center justify-center">
              {/* Outer light ring */}
              <div className="absolute inset-0 rounded-full border-[4px] border-brand/10" />
              {/* Spinning arc (76x76 SVG) */}
              <div className="absolute inset-[10px] flex items-center justify-center">
                <img
                  src={loaderCircle}
                  alt=""
                  className="h-[76px] w-[76px] animate-spin"
                  style={{ animationDuration: '1.4s' }}
                />
              </div>
              {/* Center shield-check */}
              <img src={shieldCheck} alt="" className="relative z-10 h-4 w-4" />
              {/* Small bottom-right circle */}
              <div className="absolute right-[8px] top-[32px] h-8 w-8 rounded-2xl border-2 border-white shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1)]" />
            </div>

            {/* Title */}
            <p className="mt-[112px] text-[20px] font-bold leading-7 tracking-[-0.5px] text-[#161a1d]">
              채팅내용을 분석 하고 있습니다
            </p>
            <div className="mt-3 text-xs leading-5 text-[#31383f]">
              <p>입력하신 내용을 바탕으로</p>
              <p>최적의 법률 프레임워크를 구성 중입니다.</p>
            </div>

            {/* Time indicator */}
            <div className="mt-7 flex items-center gap-2">
              <Clock size={16} className="text-brand" />
              <span className="text-xs font-medium text-[#1d2125]">약 10~30초 소요</span>
            </div>

            {/* Elapsed */}
            <p className="mt-4 text-xs tabular-nums text-gray-400">{elapsedSecs}초 경과</p>
          </>
        )}
      </main>

      {/* Bottom security notice (figma 07) */}
      {!timedOut && !classificationResult && (
        <div className="px-6 pb-8 pt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[-0.5px] text-[#31383f]/60">
            <span className="h-px w-8 bg-[#dee1e6]" />
            <span>Secure Data Processing</span>
            <span className="h-px w-8 bg-[#dee1e6]" />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-[#31383f]/40">
            SHIELD는 모든 데이터를 암호화하여 처리하며, 분석 완료 후 안전하게 결과를 전달합니다.
          </p>
        </div>
      )}
    </div>
  );
}
