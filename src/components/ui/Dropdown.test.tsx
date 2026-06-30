import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Dropdown } from './Dropdown'

describe('Dropdown', () => {
  it('shows menu items after the trigger is clicked', async () => {
    render(
      <Dropdown
        trigger="Menu"
        items={[
          { label: 'Profile', onSelect: () => {} },
          { label: 'Sign out', onSelect: () => {} },
        ]}
      />,
    )
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(await screen.findByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Sign out')).toBeInTheDocument()
  })

  it('calls onSelect when an item is chosen', async () => {
    const onSelect = vi.fn()
    render(<Dropdown trigger="Menu" items={[{ label: 'Profile', onSelect }]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }))
    await userEvent.click(await screen.findByText('Profile'))
    expect(onSelect).toHaveBeenCalledOnce()
  })
})
