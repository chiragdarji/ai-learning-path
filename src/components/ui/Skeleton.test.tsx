import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('renders an accessible busy placeholder', () => {
    render(<Skeleton />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('applies width and height via inline style', () => {
    render(<Skeleton width="120px" height="20px" />)
    const el = screen.getByRole('status')
    expect(el).toHaveStyle({ width: '120px', height: '20px' })
  })
})
