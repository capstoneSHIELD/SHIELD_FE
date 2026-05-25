import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spinner } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { validateKakaoState, getKakaoRedirectUri } from '@/lib/kakao';
import { authApi } from '@/lib/authApi';
import { getRoleHome, routeAfterSocialLogin } from '@/lib/authFlow';

export function KakaoCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const calledRef = useRef(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Guard against double-calls (StrictMode / re-renders)
    if (calledRef.current) return;
    calledRef.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      sessionStorage.removeItem('kakao_oauth_state');
      navigate('/login', { replace: true, state: { error: `kakao_${error}` } });
      return;
    }

    // Validate CSRF state before anything else
    if (!validateKakaoState(state)) {
      navigate('/login', { replace: true, state: { error: 'invalid_state' } });
      return;
    }

    if (!code) {
      navigate('/login', { replace: true, state: { error: 'authorization_code_missing' } });
      return;
    }

    (async () => {
      try {
        // 백엔드 계약상 최초 OAuth 로그인은 기본 USER로 시작하고, 신규 사용자는 온보딩에서 역할을 선택한다.
        // redirectUri 는 authorization 요청 때 사용한 URI 와 정확히 일치해야 BE 의 토큰 교환이 성공한다.
        const { data } = await authApi.kakaoLogin({
          authorizationCode: code,
          redirectUri: getKakaoRedirectUri(),
          role: 'USER',
        });

        const payload = data.data;
        const { accessToken, isNewUser, role, name, email } = payload;

        await login(accessToken);

        const next = routeAfterSocialLogin({ isNewUser, role });
        if (next === '/role-select') {
          navigate(next, {
            replace: true,
            state: { accessToken, name, email, provider: 'kakao' },
          });
          return;
        }
        navigate(getRoleHome(role), { replace: true });
      } catch (err) {
        console.error('[KakaoCallback] Error:', err);
        setErrorMsg('카카오 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
        setTimeout(() => {
          navigate('/login', { replace: true, state: { error: 'kakao_auth_failed' } });
        }, 2000);
      }
    })();
  }, [searchParams, navigate, login]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
      {errorMsg ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-[#EF4444] font-medium">{errorMsg}</p>
          <p className="text-xs text-[#64748B]">로그인 페이지로 이동합니다...</p>
        </div>
      ) : (
        <Spinner size="lg" text="로그인 처리 중..." />
      )}
    </div>
  );
}