/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL?: string
  readonly SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_PLAUSIBLE_DOMAIN?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_ADMIN_EMAILS?: string
  /** @deprecated use SUPABASE_URL */
  readonly VITE_SUPABASE_URL?: string
  /** @deprecated use SUPABASE_PUBLISHABLE_KEY */
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
