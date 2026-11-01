/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CONTACT_ENDPOINT?: string;
  /** "work" builds the recruiter-only site (see src/lib/mode.ts). */
  readonly PUBLIC_SITE_MODE?: 'full' | 'work';
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __introFailsafe?: number;
  siteOverlay: {
    open(id: string, close: () => void): void;
    close(id: string, then?: () => void): void;
    isOpen(id: string): boolean;
  };
}
