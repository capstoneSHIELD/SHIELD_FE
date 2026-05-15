import { useState } from 'react';
import { ChevronRight, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { PageHeader } from '@/components/mobile/PageHeader';
import { Button } from '@/components/ui';
import type { PendingRegistrationState } from '@/lib/authFlow';

import lawyerIcon from '@/assets/figma/role-selection/lawyer-icon.svg';

type Role = 'client' | 'lawyer';

interface RoleCardProps {
  selected: boolean;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  onClick: () => void;
}

function RoleCard({ selected, icon, iconBg, title, description, onClick }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative h-[130px] w-full rounded-[13px] border-2 bg-white px-6 text-left',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        selected
          ? 'border-brand shadow-[0px_4px_8px_0px_rgba(35,37,41,0.08)]'
          : 'border-[#e0e2e6] hover:border-brand/50',
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-full', iconBg)}>
          {icon}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-[18px] font-bold leading-7 text-[#16181d]">{title}</span>
          <span className="text-[11px] leading-[15px] text-text-soft">{description}</span>
        </div>
        <ChevronRight size={20} className="shrink-0 text-text-soft opacity-60" />
      </div>
    </button>
  );
}

export function RoleSelectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pending = (location.state ?? null) as PendingRegistrationState | null;
  const [selected, setSelected] = useState<Role | null>(null);

  const handleNext = () => {
    if (!selected) return;
    navigate(`/register/${selected}`, {
      state: pending ?? undefined,
    });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-white">
      <PageHeader />

      <div className="relative flex flex-1 flex-col px-[25px]">
        {/* Title */}
        <h1 className="mt-[30px] text-[24px] font-bold leading-8 tracking-[-0.7px] text-[#16181d]">
          어떤 <span className="text-brand">역할</span>로
          <br />
          이용하시겠습니까?
        </h1>

        {/* Cards */}
        <div className="mt-10 flex flex-col gap-4">
          <RoleCard
            selected={selected === 'client'}
            icon={<User size={28} className="text-brand" />}
            iconBg="bg-brand/10"
            title="의뢰인 (Client)"
            description="인공지능 법률 상담을 통해 고민을 해결하고 적합한 변호사를 찾고 싶습니다."
            onClick={() => setSelected('client')}
          />
          <RoleCard
            selected={selected === 'lawyer'}
            icon={<img src={lawyerIcon} alt="" className="h-7 w-7" />}
            iconBg="bg-green-400/15"
            title="변호사 (Lawyer)"
            description="전문적인 법률 지식을 공유하고 새로운 의뢰인과 사건을 수임하고 싶습니다."
            onClick={() => setSelected('lawyer')}
          />
        </div>

        {/* Next button — figma 03: Button lg */}
        <div className="mt-auto pt-10 pb-6">
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleNext}
            disabled={!selected}
          >
            다음
          </Button>
          <p className="mt-6 text-center text-[10px] font-medium leading-4 text-text-soft opacity-60">
            SHIELD의 모든 데이터는 강력한 보안 기술로 보호됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
