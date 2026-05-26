import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from 'firebase/messaging';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { isNativePlatform } from './platform';

const firebaseConfig = {
  apiKey: 'AIzaSyChjdnEuvgAYmcl5ouSicr8T2YuSRXpFzc',
  authDomain: 'capstone-shield.firebaseapp.com',
  projectId: 'capstone-shield',
  storageBucket: 'capstone-shield.firebasestorage.app',
  messagingSenderId: '999340953047',
  appId: '1:999340953047:web:e4d073414bddb1f4f84f92',
};

const VAPID_KEY =
  'BCxvwC3thdlqjKLqFVmoog6x_9O6d3ZewiCSHLG-Uo2QF6G-313u7JapJYn4R7KjGNSa-t0ZB5-oKxzNR6B8uz4';

const app = initializeApp(firebaseConfig);

let messagingInstance: Messaging | null = null;

async function getMessagingInstance(): Promise<Messaging | null> {
  if (messagingInstance) return messagingInstance;
  const supported = await isSupported();
  if (!supported) return null;
  messagingInstance = getMessaging(app);
  return messagingInstance;
}

/**
 * FCM 토큰 발급 (Issue #58).
 *
 * - 네이티브 (Capacitor): `@capacitor-firebase/messaging` 사용. Android FCM 토큰 발급.
 * - 웹: Firebase Web SDK + Service Worker 사용 (기존 흐름).
 */
export async function requestFcmToken(): Promise<string | null> {
  if (isNativePlatform()) {
    const permResult = await FirebaseMessaging.requestPermissions();
    if (permResult.receive !== 'granted') return null;
    const { token } = await FirebaseMessaging.getToken();
    return token || null;
  }

  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const registration = await navigator.serviceWorker.ready;
  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  return token || null;
}

export interface FcmPayload {
  title?: string;
  body?: string;
  data?: Record<string, string>;
}

/**
 * Foreground 메시지 수신 구독.
 *
 * - 네이티브: Capacitor 플러그인이 `notificationReceived` 이벤트로 전달. OS 가 알림 자동 표시.
 * - 웹: Firebase `onMessage` 사용. 호출자가 직접 ServiceWorker `showNotification` 표시.
 */
export async function subscribeForegroundMessages(
  callback: (payload: FcmPayload) => void,
): Promise<void> {
  if (isNativePlatform()) {
    await FirebaseMessaging.addListener('notificationReceived', (event) => {
      const n = event.notification;
      callback({
        title: n.title ?? undefined,
        body: n.body ?? undefined,
        data: (n.data as Record<string, string> | undefined) ?? undefined,
      });
    });
    return;
  }

  const messaging = await getMessagingInstance();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    callback({
      title: payload.notification?.title,
      body: payload.notification?.body,
      data: payload.data as Record<string, string> | undefined,
    });
  });
}