import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('associates the label with the input for accessibility', () => {
    render(<Input id="email" label="Email address" />)
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
  })

  it('fires onChange with typed value', () => {
    const onChange = vi.fn()
    render(<Input id="name" label="Name" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('renders an error message linked via aria-describedby', () => {
    render(<Input id="pw" label="Password" error="Too short" />)
    const input = screen.getByLabelText('Password')
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBe('pw-error')
    expect(screen.getByText('Too short')).toHaveAttribute('id', 'pw-error')
  })
})
