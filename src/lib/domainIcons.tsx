import {
  Home,
  Heart,
  ScrollText,
  Briefcase,
  ShieldAlert,
  CreditCard,
  Building,
  Building2,
  HelpCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * 법률 분야 → 아이콘·라벨·색상 중앙 매핑.
 *
 * BE 가 반환하는 분야 식별자가 (a) 새 8개 한글 분류명 (예: '부동산 거래')
 * 또는 (b) 옛 4개 enum (예: 'CIVIL') 어느 쪽이든 동일하게 동작하도록 양쪽 키를 모두 등록.
 *
 * 사용처: ClassifyBadge, AnalyzingPage, BriefDetailPage, FinalReviewPage,
 *        ConsultationListPage, HomePage 등 분야가 표시되는 모든 화면.
 *
 * SHIELD 로고와 톤 통일: 모든 사용처에서 `size={20} strokeWidth={1.75}` 권장.
 */
export interface DomainMeta {
  id: string;
  label: string;
  Icon: LucideIcon;
  /** tailwind text color class (예: 'text-amber-600') */
  color: string;
  /** tailwind background color class (예: 'bg-amber-50') */
  bgColor: string;
}

const META_LIST: DomainMeta[] = [
  // ── 새 8개 분야 (한글 분류명 기준) ───────────────────────────────────────
  {
    id: '부동산 거래',
    label: '부동산 거래',
    Icon: Home,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    id: '이혼·위자료·재산분할',
    label: '이혼·위자료·재산분할',
    Icon: Heart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
  },
  {
    id: '상속·유류분·유언',
    label: '상속·유류분·유언',
    Icon: ScrollText,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
  {
    id: '근로계약·해고·임금',
    label: '근로계약·해고·임금',
    Icon: Briefcase,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: '손해배상·불법행위',
    label: '손해배상·불법행위',
    Icon: ShieldAlert,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: '채무·보증·개인파산·회생',
    label: '채무·보증·개인파산·회생',
    Icon: CreditCard,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: '임대차보호',
    label: '임대차보호',
    Icon: Building,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
  },
  {
    id: '기업·상사거래',
    label: '기업·상사거래',
    Icon: Building2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  // ── 옛 4개 분야 (BE 응답이 아직 옛 enum 인 경우 호환) ─────────────────────
  {
    id: 'CIVIL',
    label: '민사',
    Icon: Briefcase,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'CRIMINAL',
    label: '형사',
    Icon: ShieldAlert,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: 'LABOR',
    label: '노동',
    Icon: Briefcase,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'SCHOOL_VIOLENCE',
    label: '학교폭력',
    Icon: ShieldAlert,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

const DOMAIN_META: Record<string, DomainMeta> = Object.fromEntries(
  META_LIST.map((m) => [m.id, m]),
);

const UNKNOWN: DomainMeta = {
  id: 'UNKNOWN',
  label: '미분류',
  Icon: HelpCircle,
  color: 'text-gray-500',
  bgColor: 'bg-gray-100',
};

/**
 * 분야 식별자로 메타 정보를 조회. 매핑 없는 식별자는 식별자 자체를 라벨로 사용한 UNKNOWN 메타.
 */
export function getDomainMeta(id?: string | null): DomainMeta {
  if (!id) return UNKNOWN;
  return DOMAIN_META[id] ?? { ...UNKNOWN, id, label: id };
}

/**
 * 8개 분야 전체 메타 (새 분류 체계만). 분야 선택 picker 등에서 사용.
 */
export const NEW_DOMAIN_META_LIST: DomainMeta[] = META_LIST.slice(0, 8);
