/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_KAKAO_CLIENT_ID: string;
  readonly VITE_KAKAO_REDIRECT_URI: string;
  readonly VITE_NAVER_CLIENT_ID: string;
  readonly VITE_NAVER_REDIRECT_URI: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
