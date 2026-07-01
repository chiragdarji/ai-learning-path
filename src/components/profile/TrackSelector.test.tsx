import { screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { TrackSelector } from './TrackSelector'

describe('TrackSelector', () => {
  it('renders a labeled track select with persona options', () => {
    renderWithProviders(<TrackSelector />)
    const select = screen.getByLabelText(/Your track/i) as HTMLSelectElement
    expect(select).toBeInTheDocument()
    expect(select.options.length).toBeGreaterThan(1)
  })

  it('changes the selected track', () => {
    renderWithProviders(<TrackSelector />)
    const select = screen.getByLabelText(/Your track/i) as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'ic-engineer' } })
    expect(select.value).toBe('ic-engineer')
  })
})
