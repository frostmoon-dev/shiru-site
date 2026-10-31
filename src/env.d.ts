/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CONTACT_ENDPOINT?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __introFailsafe?: number;
  shiruOverlay: {
    open(id: string, close: () => void): void;
    close(id: string, then?: () => void): void;
    isOpen(id: string): boolean;
  };
}
