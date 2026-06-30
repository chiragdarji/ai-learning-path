import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  it('renders its children', () => {
    render(<Card>Body content</Card>)
    expect(screen.getByText('Body content')).toBeInTheDocument()
  })

  it('forwards a custom className', () => {
    render(<Card className="extra">x</Card>)
    expect(screen.getByText('x')).toHaveClass('extra')
  })

  it('sets the interactive data attribute when interactive', () => {
    render(<Card interactive>x</Card>)
    expect(screen.getByText('x')).toHaveAttribute('data-interactive', 'true')
  })
})
