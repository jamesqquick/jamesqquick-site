/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GA_MEASUREMENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
