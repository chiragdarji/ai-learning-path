import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('applies the tone data attribute', () => {
    render(<Badge tone="success">Done</Badge>)
    expect(screen.getByText('Done')).toHaveAttribute('data-tone', 'success')
  })

  it('defaults to the neutral tone', () => {
    render(<Badge>Plain</Badge>)
    expect(screen.getByText('Plain')).toHaveAttribute('data-tone', 'neutral')
  })
})
