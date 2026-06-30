import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Tabs } from './Tabs'

const items = [
  { value: 'a', label: 'First', content: <p>Panel A</p> },
  { value: 'b', label: 'Second', content: <p>Panel B</p> },
]

describe('Tabs', () => {
  it('renders the default tab panel', () => {
    render(<Tabs defaultValue="a" items={items} />)
    expect(screen.getByText('Panel A')).toBeVisible()
    expect(screen.queryByText('Panel B')).not.toBeInTheDocument()
  })

  it('switches panel when another tab is clicked', async () => {
    render(<Tabs defaultValue="a" items={items} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Second' }))
    expect(screen.getByText('Panel B')).toBeVisible()
  })

  it('exposes tablist semantics', () => {
    render(<Tabs defaultValue="a" items={items} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })
})
