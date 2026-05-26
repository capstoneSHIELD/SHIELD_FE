import { Browser } from '@capacitor/browser';
import { GOOGLE_CLIENT_ID } from './constants';
import { isNativePlatform } from './platform';

const WEB_CALLBACK_PATH = '/auth/google/callback';
const MOBILE_CALLBACK_PATH = '/auth/google/callback-mobile';
const PUBLIC_BASE_URL = 'https://shieldai.kr';

/**
 * Google 로그인 시작 (Issue #56).
 *
 * - 웹: window.location 으로 Google 인증 페이지 이동
 * - 네이티브 (Capacitor Android): 시스템 브라우저로 열고, redirect_uri 는
 *   `https://shieldai.kr/auth/google/callback-mobile`. mobile callback 페이지가
 *   받은 code 를 `shield://` deep link 로 native 앱에 전달.
 *
 * Google 정책상 redirect URI 는 https 만 받으므로 Kakao/Naver 와 동일 패턴.
 */
export function loginWithGoogle(): void {
  if (!GOOGLE_CLIENT_ID) {
    console.warn('Google Client ID not configured');
    return;
  }

  const native = isNativePlatform();
  const redirectUri = native
    ? `${PUBLIC_BASE_URL}${MOBILE_CALLBACK_PATH}`
    : `${window.location.origin}${WEB_CALLBACK_PATH}`;

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  if (native) {
    Browser.open({ url, presentationStyle: 'fullscreen' });
  } else {
    window.location.href = url;
  }
}

export function getGoogleRedirectUri(): string {
  return isNativePlatform()
    ? `${PUBLIC_BASE_URL}${MOBILE_CALLBACK_PATH}`
    : `${window.location.origin}${WEB_CALLBACK_PATH}`;
}