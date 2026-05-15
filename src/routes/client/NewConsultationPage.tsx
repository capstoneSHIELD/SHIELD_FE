import { useNavigate } from 'react-router-dom';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useCreateConsultation } from '@/hooks/useConsultation';
import { PageHeader } from '@/components/mobile/PageHeader';
import { LEGAL_CATEGORY_TREE } from '@/lib/legalCategories';

// ─── page ────────────────────────────────────────────────────────────────────

/**
 * 와이어프레임 04 정합:
 *   - 단일 선택 flat 리스트로 단순화 (L1 8개 + 모르겠음 1개)
 *   - 항목 탭 즉시 상담 생성 → 다음 화면으로 이동
 *   - 검색·트리·체크박스 제거 (기존 LEGAL_CATEGORY_TREE에서 L1 이름만 사용)
 */
export function NewConsultationPage() {
  const navigate = useNavigate();
  const { mutate: createConsultation, isPending } = useCreateConsultation();

  const l1Items = LEGAL_CATEGORY_TREE.map((node) => node.name);

  function handleSelect(name: string | null) {
    const request = name
      ? { domains: [name], subDomains: [], tags: [] }
      : { domains: [], subDomains: [], tags: [] };

    createConsultation(request, {
      onSuccess: (res) => {
        const newId = res.data.data.consultationId;
        navigate(`/consultations/${newId}`);
      },
    });
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[390px] flex-col bg-white">
      <PageHeader title="분야 직접 선택" />

      <main className="flex-1 overflow-y-auto px-5 pt-4 pb-8">
        <div className="mb-5">
          <h1 className="text-[20px] font-bold leading-7 text-[#161a1d]">
            <span className="text-brand">법률 분야</span>를 선택해 주세요
          </h1>
          <p className="mt-1.5 text-sm text-[#31383f]">
            선택하신 분야로 상담이 시작됩니다.
          </p>
        </div>

        <ul className="divide-y divide-[#e9ecef] border-y border-[#e9ecef]">
          {l1Items.map((name) => (
            <li key={name}>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSelect(name)}
                className={cn(
                  'flex w-full items-center justify-between px-1 py-4 text-left',
                  'transition-colors hover:bg-[#f9fafb] active:bg-[#f3f5f6]',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                )}
              >
                <span className="text-base text-[#161a1d]">{name}</span>
                <ChevronRight size={20} className="text-[#9aa0a6]" aria-hidden="true" />
              </button>
            </li>
          ))}

          <li>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(null)}
              className={cn(
                'flex w-full items-center justify-between px-1 py-4 text-left',
                'transition-colors hover:bg-[#f9fafb] active:bg-[#f3f5f6]',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
              )}
            >
              <span className="flex items-center gap-2 text-base text-[#31383f]">
                <HelpCircle size={16} className="text-[#9aa0a6]" aria-hidden="true" />
                잘 모르겠어요
              </span>
              <ChevronRight size={20} className="text-[#9aa0a6]" aria-hidden="true" />
            </button>
          </li>
        </ul>

        <p className="mt-4 text-xs leading-relaxed text-[#62686f]">
          분야를 선택하면 AI 상담사가 사건을 더 정확하게 이해할 수 있습니다.
          확실하지 않다면 &lsquo;잘 모르겠어요&rsquo;를 눌러주세요.
        </p>
      </main>
    </div>
  );
}
