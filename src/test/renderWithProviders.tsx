import type { ReactElement, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthProvider'
import { LocaleProvider } from '../context/LocaleProvider'

export function renderWithProviders(
  ui: ReactElement,
  { route = '/' }: { route?: string } = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AuthProvider>
        <LocaleProvider>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </LocaleProvider>
      </AuthProvider>
    )
  }
  return render(ui, { wrapper: Wrapper })
}
