import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { User, MapPin, Award, CheckCircle2, Search, Landmark } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useLawyerDetail } from '@/hooks/useLawyer';
import { useDeliverBrief, useDeliveries, useLawyerRecommendations } from '@/hooks/useBrief';
import { Avatar, Button, Card, Spinner, Modal } from '@/components/ui';
import { PageHeader } from '@/components/mobile/PageHeader';
import { DOMAIN_LABELS } from '@/lib/constants';

// ─── page ────────────────────────────────────────────────────────────────────

export function LawyerProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id = '' } = useParams<{ id: string }>();

  // BriefDetailPage 의 "프로필 보기" 에서 navigate state 로 briefId 를 넘겨준 경우에만
  // 전달 플로우 활성화. 일반 변호사 탐색 진입 시에는 전달 CTA 를 숨긴다.
  const briefId = (location.state as { briefId?: string } | null)?.briefId;

  const { data: lawyer, isLoading } = useLawyerDetail(id);
  const deliverBrief = useDeliverBrief(briefId ?? '');

  // 이미 이 의뢰서가 이 변호사에게 전달됐는지 체크
  const { data: deliveries } = useDeliveries(briefId ?? '');
  const alreadyDelivered = (deliveries ?? []).some((d) => d.lawyerId === id);

  // B-12: 추천 진입(briefId 존재)일 때만 매칭 키워드 카드 표시
  const { data: recommendations } = useLawyerRecommendations(briefId ?? '', !!briefId);
  const matchedKeywords =
    recommendations?.find((r) => r.lawyerId === id)?.matchedKeywords ?? null;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [alreadyOpen, setAlreadyOpen] = useState(false);

  async function handleDeliver() {
    if (!briefId) return;
    await deliverBrief.mutateAsync(id);
    setConfirmOpen(false);
    setSuccessOpen(true);
  }

  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col bg-white">
      <PageHeader title="변호사 프로필" />

      <main className="flex-1 space-y-3 px-4 py-4 pb-28">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        )}

        {/* Not found */}
        {!isLoading && !lawyer && (
          <div className="flex flex-col items-center justify-center gap-4 pt-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <User size={36} className="text-gray-300" aria-hidden="true" />
            </div>
            <p className="text-base font-medium text-gray-500">
              변호사 정보를 찾을 수 없습니다
            </p>
          </div>
        )}

        {lawyer && (
          <>
            {/* ── B-11: 가로형 프로필 헤더 카드 ── */}
            <Card padding="md">
              <div className="flex items-start gap-4">
                {/* Avatar (left) */}
                <Avatar url={lawyer.profileImageUrl} name={lawyer.name} size={80} />

                {/* Right column */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  {/* Name + experience badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-[18px] font-bold text-[#16181d]">
                      {lawyer.name} 변호사
                    </h2>
                    <span className="bg-info-bg text-[#0680f9] text-xs font-medium px-2 py-1 rounded-[8px]">
                      경력 {lawyer.experienceYears}년
                    </span>
                  </div>

                  {/* Specialty chips */}
                  {lawyer.domains && lawyer.domains.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {lawyer.domains.map((d: string) => (
                        <span
                          key={d}
                          className="bg-gray-100 text-text-soft text-xs font-normal px-2 py-0.5 rounded-[8px]"
                        >
                          {DOMAIN_LABELS[d] ?? d}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Region */}
                  {lawyer.region && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={12} aria-hidden="true" />
                      {lawyer.region}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* ── B-12: 내 사건과의 매칭 키워드 카드 (추천 진입 시만) ── */}
            {briefId && matchedKeywords && matchedKeywords.length > 0 && (
              <Card padding="md" className="!bg-[#e1f1fd] !border-transparent">
                <div className="flex items-center gap-1.5 mb-2">
                  <Search size={14} className="text-brand" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-[#0680f9]">내 사건과의 매칭 키워드</h3>
                </div>
                <p className="text-xs text-[#3d434a] leading-relaxed mb-3">
                  사건 분석 결과, 다음 핵심 키워드에서
                  <strong className="text-brand"> {matchedKeywords.length}건</strong>의 전문성이 확인되었습니다.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matchedKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center px-2.5 py-1 rounded-full bg-white text-brand text-xs font-medium border border-brand/20"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* ── B-13: 주요 수행 사례 (수치 강조 2분할) ── */}
            <Card padding="md">
              <div className="flex items-center gap-1.5 mb-3">
                <Landmark size={14} className="text-brand" aria-hidden="true" />
                <h3 className="text-sm font-bold text-[#161a1d]">주요 수행 사례</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand leading-tight">
                    {lawyer.caseCount > 0 ? `${lawyer.caseCount}+` : '–'}
                  </p>
                  <p className="text-xs text-[#62686f] mt-1">관련 승소 사례</p>
                </div>
                <div className="text-center border-l border-[#f0f1f3]">
                  <p className="text-2xl font-bold text-brand leading-tight">
                    {lawyer.experienceYears}년
                  </p>
                  <p className="text-xs text-[#62686f] mt-1">통합 실무 경력</p>
                </div>
              </div>
            </Card>

            {/* ── B-14: 전문 자격 및 약력 ── */}
            {lawyer.certifications && lawyer.certifications.length > 0 && (
              <Card padding="md">
                <div className="flex items-center gap-1.5 mb-3">
                  <Award size={14} className="text-brand" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-[#161a1d]">전문 자격 및 약력</h3>
                </div>
                <ul className="space-y-2.5">
                  {lawyer.certifications.map((cert) => (
                    <li key={cert} className="flex items-start gap-2 text-sm">
                      <CheckCircle2
                        size={16}
                        className="text-brand flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span className="text-[#161a1d] font-semibold leading-snug">{cert}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* ── B-14: 소개 ── */}
            {lawyer.bio && (
              <Card padding="md">
                <div className="flex items-center gap-1.5 mb-2">
                  <User size={14} className="text-brand" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-[#161a1d]">소개</h3>
                </div>
                <p className="text-sm text-[#3d434a] leading-relaxed whitespace-pre-wrap">
                  {lawyer.bio}
                </p>
              </Card>
            )}

            {/* ── Tags (전문 분야 상세) ── */}
            {lawyer.tags && lawyer.tags.length > 0 && (
              <Card padding="md">
                <h3 className="text-sm font-bold text-[#161a1d] mb-2">전문 분야 상세</h3>
                <div className="flex flex-wrap gap-1.5">
                  {lawyer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-1 rounded-full bg-info-bg text-brand text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </main>

      {/* ── Bottom fixed CTA — briefId 를 route state 로 받았을 때만 ── */}
      {lawyer && briefId && (
        <div
          className={cn(
            'sticky bottom-0 z-30',
            'bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom',
          )}
        >
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              if (alreadyDelivered) {
                setAlreadyOpen(true);
                return;
              }
              setConfirmOpen(true);
            }}
          >
            의뢰서 전달하기
          </Button>
        </div>
      )}

      {/* ── 전달 확인 모달 ── */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="의뢰서 전달"
      >
        <p className="text-sm text-gray-700 mb-5">
          <span className="font-semibold text-gray-900">{lawyer?.name}</span> 변호사에게
          의뢰서를 전달하시겠습니까?
        </p>
        <div className="flex gap-2">
          <Button
            variant="primary"
            fullWidth
            isLoading={deliverBrief.isPending}
            onClick={handleDeliver}
          >
            전달하기
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setConfirmOpen(false)}
          >
            취소
          </Button>
        </div>
      </Modal>

      {/* ── 이미 전달된 변호사 모달 ── */}
      <Modal
        isOpen={alreadyOpen}
        onClose={() => setAlreadyOpen(false)}
        title="전달 불가"
      >
        <p className="text-sm text-gray-700 mb-5">
          <span className="font-semibold text-gray-900">{lawyer?.name}</span> 변호사에게는
          이미 의뢰서를 전달했습니다.
        </p>
        <Button
          variant="primary"
          fullWidth
          onClick={() => setAlreadyOpen(false)}
        >
          확인
        </Button>
      </Modal>

      {/* ── 전달 완료 모달 ── */}
      <Modal
        isOpen={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          if (briefId) navigate(`/briefs/${briefId}/delivery`);
        }}
        title="전달 완료"
      >
        <div className="flex flex-col items-center gap-3 py-2">
          <CheckCircle2 size={48} className="text-brand" aria-hidden="true" />
          <p className="text-base font-semibold text-gray-900">
            의뢰서가 전달되었습니다
          </p>
        </div>
        <div className="mt-5">
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              setSuccessOpen(false);
              if (briefId) navigate(`/briefs/${briefId}/delivery`);
            }}
          >
            확인
          </Button>
        </div>
      </Modal>
    </div>
  );
}
