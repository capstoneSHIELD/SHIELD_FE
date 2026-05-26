import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { requestFcmToken, subscribeForegroundMessages } from '@/lib/firebase';
import { registerFcmToken } from '@/lib/fcmApi';
import { isNativePlatform, getPlatform } from '@/lib/platform';

export function useFcm(): void {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    (async () => {
      try {
        const token = await requestFcmToken();
        if (cancelled || !token) return;

        // device_type: ANDROID/IOS/WEB — BE 의 fcm_tokens.device_type enum 과 매칭
        const deviceType =
          getPlatform() === 'android' ? 'ANDROID' :
          getPlatform() === 'ios' ? 'IOS' :
          'WEB';

        await registerFcmToken(token, deviceType);

        await subscribeForegroundMessages(async (payload) => {
          // 네이티브: OS 가 자동으로 시스템 알림 표시 (Capacitor 플러그인 기본 동작)
          // 웹: Service Worker 로 직접 알림 띄움
          if (isNativePlatform()) return;

          // Notification API 미지원 환경(구형 브라우저, 일부 WebView) 방어
          if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
          const reg = await navigator.serviceWorker.ready;
          await reg.showNotification(payload.title || 'SHIELD', {
            body: payload.body,
            icon: '/logo.png',
            badge: '/logo.png',
            data: payload.data || {},
          });
        });
      } catch (error) {
        console.error('FCM 셋업 실패:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);
}