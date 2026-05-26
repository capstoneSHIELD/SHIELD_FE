import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spinner } from '@/components/ui';

/**
 * 모바일 native 앱 전용 Google OAuth callback (Issue #56).
 * 받은 code 를 `shield://auth/google/callback?...` deep link 로 즉시 redirect.
 * 자세한 흐름은 KakaoCallbackMobilePage 참조.
 */
export function GoogleCallbackMobilePage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    if (!params) return;
    window.location.href = `shield://auth/google/callback?${params}`;
  }, [searchParams]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <Spinner size="lg" text="앱으로 돌아가는 중..." />
      <p className="text-xs text-[#64748B] max-w-xs">
        자동으로 이동하지 않으면 SHIELD 앱을 직접 열어주세요.
      </p>
    </div>
  );
}