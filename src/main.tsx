import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { initSentry } from './lib/sentry.ts'
import App from './App.tsx'
import { Analytics } from './components/Analytics.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { AuthProvider } from './context/AuthProvider.tsx'
import { LocaleProvider } from './context/LocaleProvider.tsx'

initSentry()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <LocaleProvider>
          <BrowserRouter>
            <App />
            <Analytics />
          </BrowserRouter>
        </LocaleProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
