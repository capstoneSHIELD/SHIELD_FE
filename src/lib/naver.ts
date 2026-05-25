import { Browser } from '@capacitor/browser';
import { NAVER_CLIENT_ID, NAVER_REDIRECT_URI } from './constants';
import { isNativePlatform } from './platform';

const WEB_CALLBACK_PATH = '/auth/naver/callback';
const MOBILE_CALLBACK_PATH = '/auth/naver/callback-mobile';
const PUBLIC_BASE_URL = 'https://shieldai.kr';

/**
 * 네이버 로그인 시작.
 *
 * - 웹: window.location 으로 네이버 인증 페이지 이동
 * - 네이티브 (Capacitor Android): 시스템 브라우저로 열고, redirect_uri 는
 *   `https://shieldai.kr/auth/naver/callback-mobile` 사용. mobile callback 페이지가
 *   받은 code 를 `shield://` deep link 로 native 앱에 전달.
 */
export function loginWithNaver(): void {
  if (!NAVER_CLIENT_ID) {
    console.warn('Naver Client ID not configured');
    return;
  }

  const state = crypto.randomUUID();
  sessionStorage.setItem('naver_oauth_state', state);

  const native = isNativePlatform();
  const redirectUri = native
    ? `${PUBLIC_BASE_URL}${MOBILE_CALLBACK_PATH}`
    : (NAVER_REDIRECT_URI || `${window.location.origin}${WEB_CALLBACK_PATH}`);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: NAVER_CLIENT_ID,
    redirect_uri: redirectUri,
    state,
  });

  const url = `https://nid.naver.com/oauth2.0/authorize?${params}`;

  if (native) {
    Browser.open({ url, presentationStyle: 'fullscreen' });
  } else {
    window.location.href = url;
  }
}

export function getNaverRedirectUri(): string {
  return isNativePlatform()
    ? `${PUBLIC_BASE_URL}${MOBILE_CALLBACK_PATH}`
    : (NAVER_REDIRECT_URI || `${window.location.origin}${WEB_CALLBACK_PATH}`);
}

export function validateNaverState(state: string | null): boolean {
  const savedState = sessionStorage.getItem('naver_oauth_state');
  sessionStorage.removeItem('naver_oauth_state');
  return !!state && state === savedState;
}