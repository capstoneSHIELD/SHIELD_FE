import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shield.app',
  appName: 'SHIELD',
  webDir: 'dist',
  // 원격 모드 (Issue #52): 로컬 빌드된 dist 를 번들링하는 대신 Vercel 배포된 운영
  // FE 를 WebView 가 직접 로드. 코드 변경 시 native 재빌드 불필요 — Vercel 자동
  // 배포만으로 앱이 최신화됨. 시연/캡스톤용 모드.
  // 정식 앱스토어 배포 시엔 server 블록 제거하고 번들 모드로 전환 필요.
  server: {
    url: 'https://shieldai.kr',
    cleartext: false,
  },
};

export default config;