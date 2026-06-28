import { useEffect } from 'react'

/**
 * Optional privacy-friendly analytics. Set VITE_PLAUSIBLE_DOMAIN in Vercel env.
 */
export function Analytics() {
  useEffect(() => {
    const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN
    if (!domain || document.querySelector('[data-plausible]')) return

    const script = document.createElement('script')
    script.defer = true
    script.dataset.domain = domain
    script.dataset.plausible = 'true'
    script.src = 'https://plausible.io/js/script.js'
    document.head.appendChild(script)
  }, [])

  return null
}
