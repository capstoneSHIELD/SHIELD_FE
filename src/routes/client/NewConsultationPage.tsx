import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useCreateConsultation } from '@/hooks/useConsultation';
import { PageHeader } from '@/components/mobile/PageHeader';
import { Button } from '@/components/ui';
import { LEGAL_CATEGORY_TREE } from '@/lib/legalCategories';

// ─── page ────────────────────────────────────────────────────────────────────

export function NewConsultationPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isUnknown, setIsUnknown] = useState(false);
  const [query, setQuery] = useState('');
  const { mutate: createConsultation, isPending } = useCreateConsultation();

  // 평평한 L1 도메인 리스트 — figma 04 디자인은 단일 레벨
  const domains = useMemo(() => LEGAL_CATEGORY_TREE.map((n) => n.name), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return domains;
    return domains.filter((d) => d.toLowerCase().includes(q));
  }, [domains, query]);

  const isDomainChosen = selected.size > 0 || isUnknown;

  function toggleDomain(name: string) {
    setIsUnknown(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function handleUnknownToggle() {
    setIsUnknown((v) => !v);
    if (!isUnknown) setSelected(new Set());
  }

  function handleSubmit() {
    if (!isDomainChosen) return;

    const request = isUnknown
      ? { domains: [], subDomains: [], tags: [] }
      : {
          domains: Array.from(selected),
          subDomains: [],
          tags: [],
        };

    createConsultation(request, {
      onSuccess: (res) => {
        const newId = res.data.data.consultationId;
        navigate(`/consultations/${newId}`);
      },
    });
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[390px] flex-col bg-white">
      <PageHeader title="분야 선택" />

      <main className="flex flex-1 flex-col overflow-y-auto px-[25px] pt-4 pb-24">
        {/* Title — figma 04 */}
        <h1 className="text-[20px] font-bold leading-[25px] text-[#181b20]">
          어떤 <span className="text-brand">법률 분야</span>를
          <br />
          선택 하시겠습니까?
        </h1>

        {/* Search input — figma 04 */}
        <div className="mt-[40px] relative">
          <Search
            size={20}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#adb5bd]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="전문 분야 검색.."
            className={cn(
              'h-[45px] w-full rounded-[12px] border border-[#adb5bd] bg-white',
              'pl-10 pr-4 text-sm',
              'placeholder:text-[#adb5bd]',
              'shadow-[0px_4px_8px_0px_rgba(35,37,41,0.04)]',
              'outline-none transition-colors',
              'focus:border-brand',
            )}
          />
        </div>

        {/* Domain list — figma 04 */}
        <div className="mt-4 rounded-[12px] border border-[#adb5bd] bg-white overflow-hidden shadow-[0px_4px_8px_0px_rgba(35,37,41,0.04)]">
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-[#adb5bd]">
              검색 결과가 없습니다
            </div>
          ) : (
            filtered.map((name, idx) => {
              const isSelected = selected.has(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleDomain(name)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left',
                    'transition-colors duration-150',
                    'hover:bg-brand/5',
                    'focus-visible:outline-none focus-visible:bg-brand/10',
                    idx !== filtered.length - 1 && 'border-b border-[#e0e2e6]',
                    isSelected && 'bg-brand/5',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                      isSelected
                        ? 'border-brand bg-brand text-white'
                        : 'border-[#adb5bd] bg-white',
                    )}
                  >
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </span>
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      isSelected ? 'font-semibold text-[#16181d]' : 'text-black',
                    )}
                  >
                    {name}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* "잘 모르겠어요" option */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleUnknownToggle}
            className={cn(
              'text-sm font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:underline',
              isUnknown
                ? 'text-brand underline'
                : 'text-gray-400 hover:text-gray-600',
            )}
          >
            잘 모르겠어요
          </button>
        </div>

        <div className="flex-1" />

        {/* "다음" button — figma 04: Button lg */}
        <div className="mt-6">
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSubmit}
            disabled={!isDomainChosen}
            isLoading={isPending}
          >
            다음
          </Button>
        </div>
      </main>
    </div>
  );
}
