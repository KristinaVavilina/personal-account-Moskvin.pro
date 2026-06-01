/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Только локальная разработка: подмена текущего userId без JWT. В production игнорируется. */
  readonly VITE_DEV_USER_ID?: string;
  /** Цель прокси Vite для `/api` (npm run dev / target dev в Docker). */
  readonly VITE_API_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
