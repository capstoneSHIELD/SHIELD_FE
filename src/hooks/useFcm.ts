import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { requestFcmToken, subscribeForegroundMessages } from '@/lib/firebase';
import { registerFcmToken } from '@/lib/fcmApi';
import { isNativePlatform, getPlatform } from '@/lib/platform';

export function useFcm(): void {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    (async () => {
      try {
        const token = await requestFcmToken();
        if (cancelled || !token) return;

        const deviceType =
          getPlatform() === 'android' ? 'ANDROID' :
          getPlatform() === 'ios' ? 'IOS' :
          'WEB';

        await registerFcmToken(token, deviceType);

        await subscribeForegroundMessages(async (payload) => {
          // 옛 useEffect 의 cleanup 후 (로그아웃/재로그인 시) 살아남은 listener 가
          // 중복 toast 띄우거나 다른 사용자 알림 처리하는 것을 방지.
          // subscribeForegroundMessages 자체는 unsubscribe handle 을 반환하지 않으므로
          // closure 의 cancelled flag 로 listener 무효화.
          if (cancelled) return;

          // 1. In-app toast — foreground 일 때 사용자에게 보임 (web/native 공통)
          toast(payload.title || 'SHIELD', {
            description: payload.body,
            duration: 4000,
          });

          // 2. 메시지 type 별 React Query invalidation — 의뢰서 상태 즉시 갱신
          const type = payload.data?.type;
          if (type === 'DELIVERY_STATUS') {
            queryClient.invalidateQueries({ queryKey: ['briefs'] });
            queryClient.invalidateQueries({ queryKey: ['briefDetail'] });
            queryClient.invalidateQueries({ queryKey: ['inbox'] });
            queryClient.invalidateQueries({ queryKey: ['deliveries'] });
          }

          // 3. web 환경에서만 시스템 데스크톱 알림도 띄움 (선택)
          if (isNativePlatform()) return;
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
  }, [isAuthenticated, queryClient]);
}