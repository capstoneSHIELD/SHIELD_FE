/**
 * 날짜 포맷팅 유틸리티 — 프로젝트 전역에서 사용.
 * 기존 7개 파일에 중복 정의되어 있던 함수를 통합.
 */

/** "2026.04.17" 형식 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

/** "2026.04.17 14:30" 형식 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${h}:${min}`;
}

/** "방금 전", "3분 전", "2시간 전" 등 상대 시간 */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return '방금 전';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}개월 전`;
  return `${Math.floor(months / 12)}년 전`;
}

/**
 * 변호사 의뢰서 응답 만료 카운트다운.
 * BE 정책: sentAt + 24h 이후 자동 거절 (BE 스케줄러 미구현 상태일 수 있음).
 * BE 에 `hoursRemaining` 필드가 추가되면 본 유틸은 제거하고 응답값을 직접 사용 권장.
 *
 * @returns 남은 시간 라벨. 양수면 "N시간 남음", 1시간 미만이면 "N분 남음",
 *          만료되었으면 "응답 시간 만료", sentAt 없으면 빈 문자열.
 */
export function deliveryTimeRemaining(
  sentAtIso: string | null | undefined,
  expiryHours = 24,
): string {
  if (!sentAtIso) return '';
  const deadline = new Date(sentAtIso).getTime() + expiryHours * 60 * 60 * 1000;
  const diffMs = deadline - Date.now();
  if (diffMs <= 0) return '응답 시간 만료';
  const totalMin = Math.floor(diffMs / 60000);
  if (totalMin < 60) return `${totalMin}분 남음`;
  const hours = Math.floor(totalMin / 60);
  return `${hours}시간 남음`;
}
