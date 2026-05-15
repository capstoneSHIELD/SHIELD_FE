import { useNavigate, useParams, Link } from 'react-router-dom';
import { FileText, Scale, Pencil, TriangleAlert, Eye, Layers, CheckCircle2 } from 'lucide-react';
import { useBriefDetail } from '@/hooks/useBrief';
import { Button, Card, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/mobile/PageHeader';
import { getDomainMeta } from '@/lib/domainIcons';

// ─── helpers ────────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  editHref,
}: {
  title: string;
  editHref: string;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
      <Link
        to={editHref}
        className="inline-flex items-center gap-1 text-[13px] font-medium text-[#0680f9] hover:brightness-90 transition-colors"
      >
        <Pencil size={11} aria-hidden="true" />
        수정
      </Link>
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export function FinalReviewPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: brief, isLoading } = useBriefDetail(id);

  // ── loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto flex h-full w-full max-w-[390px] flex-col bg-white">
        <PageHeader title="의뢰서 최종 확인" />
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="mx-auto flex h-full w-full max-w-[390px] flex-col bg-white">
        <PageHeader title="의뢰서 최종 확인" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">의뢰서를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const contentExcerpt =
    brief.content.length > 120 ? brief.content.slice(0, 120) + '…' : brief.content;

  // Privacy setting labels
  const privacyLabels: Record<string, string> = {
    PUBLIC: '공개',
    PRIVATE: '비공개',
    PARTIAL: '일부 공개',
  };

  function handleSendRequest() {
    navigate(`/briefs/${id}/confirm`);
  }

  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col bg-white">
      <PageHeader title="의뢰서 최종 확인" />

      <main className="flex-1 space-y-5 px-6 py-6 pb-36">
        {/* Intro */}
        <div>
          <h2 className="text-xl font-bold text-[#161a1d] tracking-tight leading-8">
            마지막으로
            <br />
            내용을 확인해주세요.
          </h2>
          <p className="text-sm text-[#31383f] mt-2">
            작성하신 의뢰서가 변호사님께 전달됩니다.
          </p>
        </div>

        {/* Case Summary Card — B-9: 파란 strip 상단 + 분야 칩 + 제목 */}
        <Card padding="none" className="overflow-hidden">
          {/* 파란 상단 strip */}
          <div className="h-1.5 w-full bg-brand" aria-hidden="true" />

          <div className="p-4 space-y-3">
            <SectionHeader title="사건 요약" editHref={`/briefs/${id}`} />

            {/* Legal field chip (제목 위방) */}
            <div>
              {(() => {
                const meta = getDomainMeta(brief.legalField);
                return (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${meta.bgColor} ${meta.color} text-xs font-medium`}
                  >
                    <meta.Icon size={12} strokeWidth={2} aria-hidden="true" />
                    {meta.label}
                  </span>
                );
              })()}
            </div>

            {/* Title (large) */}
            <div className="flex items-start gap-2">
              <FileText size={18} className="text-brand flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-[17px] font-bold text-[#161a1d] leading-snug">{brief.title}</p>
            </div>

            {/* Content excerpt */}
            <div>
              <p className="text-xs text-gray-400 mb-0.5">내용 요약</p>
              <p className="text-sm text-gray-700 leading-relaxed">{contentExcerpt}</p>
            </div>

            {/* Keywords */}
            {brief.keywords && brief.keywords.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">키워드</p>
                <div className="flex flex-wrap gap-1.5">
                  {brief.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-full bg-info-bg text-brand text-xs font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* P-4: 분석 리포트 포함됨 한 줄 */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-[#f0f1f3] mt-1">
              <CheckCircle2 size={14} className="text-brand" aria-hidden="true" />
              <span className="text-xs font-medium text-[#3d434a]">분석 리포트 포함됨</span>
            </div>
          </div>
        </Card>

        {/* B-10: 2분할 메타 카드 (쟁점 / 개인정보) */}
        <div className="grid grid-cols-2 gap-3">
          {/* 매타 1: 분석된 쟁점 */}
          <Card padding="md" className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[#62686f]">
              <Layers size={14} aria-hidden="true" />
              <span className="text-[11px] font-medium">분석된 쟁점</span>
            </div>
            <p className="text-[15px] font-bold text-[#161a1d]">
              {brief.keyIssues?.length ?? 0}건
            </p>
          </Card>

          {/* 매타 2: 개인정보 설정 */}
          <Link to={`/briefs/${id}/privacy`} className="block">
            <Card padding="md" className="flex flex-col gap-1.5 h-full">
              <div className="flex items-center gap-1.5 text-[#62686f]">
                <Eye size={14} aria-hidden="true" />
                <span className="text-[11px] font-medium">개인정보 설정</span>
              </div>
              <p className="text-[15px] font-bold text-[#161a1d]">
                {privacyLabels[brief.privacySetting] ?? brief.privacySetting}
              </p>
            </Card>
          </Link>
        </div>

        {/* Lawyer Requirements (기존 운영 캴텍스트 유지) */}
        <Card padding="md">
          <SectionHeader title="변호사 요건" editHref={`/briefs/${id}`} />

          <div className="flex items-center gap-3">
            <Scale size={15} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-gray-500">
              {brief.strategy
                ? brief.strategy
                : '특별한 요건이 설정되지 않았습니다.'}
            </p>
          </div>
        </Card>

        {/* Warning box — figma 10 (warning-red 토큰 정합) */}
        <div className="bg-warning-red/5 border border-warning-red/20 rounded-card p-4 flex gap-3">
          <div className="shrink-0 w-9 h-9 rounded-[18px] bg-warning-red/10 flex items-center justify-center mt-1">
            <TriangleAlert size={20} className="text-warning-red" />
          </div>
          <div>
            <p className="text-sm font-bold text-warning-red mb-1">제출 전 확인 필수</p>
            <p className="text-[10px] text-warning-red/80 leading-[18px]">
              의뢰서 제출 버튼을 누른 후에는{' '}
              <span className="underline">내용을 수정할 수 없습니다.</span>
              <br />
              모든 항목이 정확한지 다시 한번 확인해 주세요.
            </p>
          </div>
        </div>
      </main>

      {/* Fixed bottom CTA */}
      <div className="sticky bottom-0 bg-white shadow-[0px_-10px_20px_0px_rgba(0,0,0,0.02)] px-6 py-6 safe-area-bottom">
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={handleSendRequest}
          className="rounded-card h-14 shadow-lg shadow-brand/20"
        >
          변호사 선택
        </Button>
        <p className="text-[10px] text-[#31383f] text-center mt-3">
          제출 시 SHIELD 서비스 이용 약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
