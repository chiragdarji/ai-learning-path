import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick} disabled>Go</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('applies the variant data attribute', () => {
    render(<Button variant="danger">Delete</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'danger')
  })
})
