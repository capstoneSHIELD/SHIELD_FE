import { defineConfig, devices } from '@playwright/test';

/**
 * Phase 5 — 적응형 회귀 방지용 Playwright 설정.
 *
 * 3개 viewport (Mobile/Tablet/Desktop) 를 project 로 분리해
 * 같은 spec 을 viewport 별로 1회씩 실행한다.
 *
 * 초기 운영: visual regression 은 warning 용도. layout 깨짐이 안정화되면
 * CI gate 로 승격한다 (phases.md §Phase 5 향후 자동화 후보).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',

  /**
   * 스크린샷 비교 정책.
   * - threshold: 픽셀별 색차 허용치 (0~1)
   * - maxDiffPixelRatio: 전체 픽셀 대비 차이 비율 허용치
   *   초기에는 폰트 렌더링/안티앨리어싱 차이를 흡수하기 위해 느슨하게 둔다.
   */
  expect: {
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    },
  },

  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    /**
     * 로컬에서 vite dev 가 basicSsl 플러그인으로 https 를 띄울 수 있으므로
     * self-signed 인증서 무시.
     */
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'mobile-360',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 360, height: 800 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'tablet-768',
      use: {
        ...devices['iPad Mini'],
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 2,
        isMobile: false,
        hasTouch: true,
      },
    },
    {
      name: 'desktop-1440',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    ignoreHTTPSErrors: true,
  },
});
