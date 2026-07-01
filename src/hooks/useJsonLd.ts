import { useEffect } from 'react'

const SCRIPT_ID = 'page-jsonld'

/**
 * Injects (or updates) a single `<script type="application/ld+json">` in the
 * document head with the given structured data. Passing `null` removes it.
 * Runtime injection is captured by the prerender step, so crawlers see the
 * JSON-LD in the static HTML.
 */
export function useJsonLd(data: object | null) {
  useEffect(() => {
    let el = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null

    if (!data) {
      if (el) el.remove()
      return
    }

    if (!el) {
      el = document.createElement('script')
      el.id = SCRIPT_ID
      el.type = 'application/ld+json'
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(data)
  }, [data])
}
