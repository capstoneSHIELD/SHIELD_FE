import { KAKAO_REST_API_KEY, KAKAO_REDIRECT_URI } from './constants';

export function loginWithKakao(): void {
  if (!KAKAO_REST_API_KEY) {
    console.warn('Kakao Client ID not configured');
    return;
  }

  const state = crypto.randomUUID();
  sessionStorage.setItem('kakao_oauth_state', state);
  const redirectUri = KAKAO_REDIRECT_URI || `${window.location.origin}/auth/kakao/callback`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: KAKAO_REST_API_KEY,
    redirect_uri: redirectUri,
    state,
    scope: 'profile_nickname',
  });

  window.location.href = `https://kauth.kakao.com/oauth/authorize?${params}`;
}

export function validateKakaoState(state: string | null): boolean {
  const savedState = sessionStorage.getItem('kakao_oauth_state');
  sessionStorage.removeItem('kakao_oauth_state');
  return !!state && state === savedState;
}
