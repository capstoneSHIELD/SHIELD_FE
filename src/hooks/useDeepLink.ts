import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, type URLOpenListenerEvent } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { isNativePlatform } from '@/lib/platform';

/**
 * Capacitor deep link listener (Issue #114).
 *
 * `shield://auth/kakao/callback?code=...` 같은 custom scheme URL 이 외부에서 앱으로
 * 호출되면 (예: 시스템 브라우저에서 OAuth 완료 후 mobile callback 페이지가 redirect),
 * URL 의 path + query 만 추출해서 react-router 의 navigate 로 이동시킨다.
 *
 * 주의: `new URL('shield://auth/kakao/callback')` 은 host='auth', pathname='/kakao/callback'
 * 로 파싱되므로 host 도 함께 prefix 해야 원래 의도한 react-router path 가 된다.
 *
 * - 시스템 브라우저 창은 Browser.close() 로 닫음.
 * - 웹 환경에서는 listener 등록 자체를 건너뜀.
 */
export function useDeepLink() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNativePlatform()) return;

    const handler = (event: URLOpenListenerEvent) => {
      try {
        const url = new URL(event.url);
        if (url.protocol !== 'shield:') return;

        // shield://auth/kakao/callback?code=... → host='auth', pathname='/kakao/callback'
        // react-router 의 navigate 가 받을 path 는 '/auth/kakao/callback' 이어야 하므로
        // host 를 path 첫 segment 로 합쳐서 복원한다.
        const target = `/${url.host}${url.pathname}${url.search}`;

        Browser.close().catch(() => {
          // 브라우저가 이미 닫혔거나 열린 적 없는 경우 무시
        });

        navigate(target, { replace: true });
      } catch (err) {
        console.error('[useDeepLink] Failed to parse URL:', event.url, err);
      }
    };

    const listenerPromise = App.addListener('appUrlOpen', handler);

    return () => {
      listenerPromise.then((listener) => listener.remove()).catch(() => {});
    };
  }, [navigate]);
}