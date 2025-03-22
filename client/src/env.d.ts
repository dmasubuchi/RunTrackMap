/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PLAYFAB_TITLE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
