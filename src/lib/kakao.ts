import { Browser } from '@capacitor/browser';
import { KAKAO_REST_API_KEY, KAKAO_REDIRECT_URI } from './constants';
import { isNativePlatform } from './platform';

const WEB_CALLBACK_PATH = '/auth/kakao/callback';
const MOBILE_CALLBACK_PATH = '/auth/kakao/callback-mobile';
const PUBLIC_BASE_URL = 'https://shieldai.kr';

/**
 * 카카오 로그인 시작.
 *
 * - 웹: window.location 으로 카카오 인증 페이지 이동 (기존 흐름)
 * - 네이티브 (Capacitor Android): 시스템 브라우저 (Chrome Custom Tabs) 로 열고,
 *   redirect_uri 는 `https://shieldai.kr/auth/kakao/callback-mobile` 사용.
 *   해당 mobile callback 페이지가 받은 code 를 `shield://` deep link 로 native 앱에 전달.
 *   (카카오 정책상 redirect URI 는 https 만 받음 — custom scheme 불가)
 */
export function loginWithKakao(): void {
  if (!KAKAO_REST_API_KEY) {
    console.warn('Kakao Client ID not configured');
    return;
  }

  const state = crypto.randomUUID();
  sessionStorage.setItem('kakao_oauth_state', state);

  const native = isNativePlatform();
  const redirectUri = native
    ? `${PUBLIC_BASE_URL}${MOBILE_CALLBACK_PATH}`
    : (KAKAO_REDIRECT_URI || `${window.location.origin}${WEB_CALLBACK_PATH}`);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: KAKAO_REST_API_KEY,
    redirect_uri: redirectUri,
    state,
    scope: 'profile_nickname',
  });

  const url = `https://kauth.kakao.com/oauth/authorize?${params}`;

  if (native) {
    Browser.open({ url, presentationStyle: 'fullscreen' });
  } else {
    window.location.href = url;
  }
}

/**
 * 네이티브 앱이 BE 에 토큰 교환 요청 시 함께 전달할 redirect URI.
 * 토큰 교환은 authorization 요청 때 사용한 URI 와 정확히 일치해야 한다.
 */
export function getKakaoRedirectUri(): string {
  return isNativePlatform()
    ? `${PUBLIC_BASE_URL}${MOBILE_CALLBACK_PATH}`
    : (KAKAO_REDIRECT_URI || `${window.location.origin}${WEB_CALLBACK_PATH}`);
}

export function validateKakaoState(state: string | null): boolean {
  const savedState = sessionStorage.getItem('kakao_oauth_state');
  sessionStorage.removeItem('kakao_oauth_state');
  return !!state && state === savedState;
}