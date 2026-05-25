import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spinner } from '@/components/ui';

/**
 * 모바일 native 앱 전용 카카오 OAuth callback (Issue #114).
 *
 * 흐름:
 *   1. native 앱 → 시스템 브라우저로 카카오 인증 페이지 띄움
 *   2. 카카오 인증 후 이 페이지 (`https://shieldai.kr/auth/kakao/callback-mobile?code=XXX`) 로 redirect
 *   3. 이 페이지는 받은 code 를 `shield://auth/kakao/callback?code=XXX&state=YYY` deep link 로 즉시 redirect
 *   4. Android 의 `shield://` scheme intent-filter 가 SHIELD 앱 실행 → app.addListener('appUrlOpen') 처리
 *
 * 카카오 정책상 redirect URI 는 https 만 받으므로 (custom scheme 불가) 이 중간 페이지가 필요.
 * 웹 브라우저로 직접 접근한 경우엔 deep link 가 동작하지 않으니 안내 문구만 표시.
 */
export function KakaoCallbackMobilePage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    if (!params) return;
    window.location.href = `shield://auth/kakao/callback?${params}`;
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