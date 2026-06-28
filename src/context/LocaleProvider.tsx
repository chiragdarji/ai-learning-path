import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { en, type Messages } from '../i18n/en'
import { es } from '../i18n/es'
import { useAuth } from './AuthProvider'
import { fetchUserProfile, upsertUserLocale } from '../services/userProfile'

export type Locale = 'en' | 'es'

const catalogs: Record<Locale, Messages> = { en, es }

interface LocaleContextValue {
  locale: Locale
  t: Messages
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem('ai-learning-path-locale')
    if (stored === 'en' || stored === 'es') return stored
  } catch {
    /* ignore */
  }
  return 'en'
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale)

  useEffect(() => {
    if (!user) return
    void fetchUserProfile(user.id).then((profile) => {
      if (profile?.locale === 'en' || profile?.locale === 'es') {
        setLocaleState(profile.locale)
        localStorage.setItem('ai-learning-path-locale', profile.locale)
      }
    })
  }, [user])

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next)
      localStorage.setItem('ai-learning-path-locale', next)
      if (user) {
        void upsertUserLocale(user.id, next).catch(console.error)
      }
    },
    [user],
  )

  const value = useMemo(
    () => ({ locale, t: catalogs[locale], setLocale }),
    [locale, setLocale],
  )

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
