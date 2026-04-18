import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useCreateConsultation } from '@/hooks/useConsultation';
import { Button, Card } from '@/components/ui';
import { CategoryPicker } from '@/components/ui/CategoryPicker';
import { Header } from '@/components/layout/Header';
import type { CategorySelection } from '@/lib/legalCategories';

// ─── page ────────────────────────────────────────────────────────────────────

export function NewConsultationPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<CategorySelection | null>(null);
  const [isUnknown, setIsUnknown] = useState(false);
  const { mutate: createConsultation, isPending } = useCreateConsultation();

  const isDomainChosen = selected !== null || isUnknown;

  function handleCategoryChange(value: CategorySelection | null) {
    setSelected(value);
    if (value) setIsUnknown(false);
  }

  function handleUnknownToggle() {
    setIsUnknown(!isUnknown);
    if (!isUnknown) setSelected(null);
  }

  function handleSubmit() {
    if (!isDomainChosen) return;

    // TODO: API가 소분류 리프를 지원하면 selected를 직접 전달
    // 현재는 기존 API 호환을 위해 domain=null로 전달
    createConsultation(null, {
      onSuccess: (res) => {
        const newId = res.data.data.consultationId;
        navigate(`/consultations/${newId}`);
      },
    });
  }

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="새 상담"
        showBack
        onBack={() => navigate(-1)}
      />

      <main className="flex-1 flex flex-col px-4 py-6 gap-6">
        {/* Description card */}
        <Card padding="md">
          <p className="text-sm font-medium text-gray-500 mb-0.5">분야 선택</p>
          <p className="text-base font-semibold text-gray-900">
            어떤 분야의 상담이 필요하신가요?
          </p>
          <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
            가장 가까운 분야를 선택해 주세요. 정확하지 않아도 괜찮습니다.
          </p>
        </Card>

        {/* Category picker */}
        <CategoryPicker
          value={selected}
          onChange={handleCategoryChange}
          placeholder="분야 검색 (예: 보증금 반환, 이혼, 해고...)"
        />

        {/* "잘 모르겠어요" option */}
        <div className="flex justify-center">
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Submit */}
        <div className="pb-safe">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isDomainChosen}
            isLoading={isPending}
            onClick={handleSubmit}
          >
            상담 시작
          </Button>
        </div>
      </main>
    </div>
  );
}
