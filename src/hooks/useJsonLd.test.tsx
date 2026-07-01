import { render, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import { useJsonLd } from './useJsonLd'

afterEach(cleanup)

function Probe({ data }: { data: object | null }) {
  useJsonLd(data)
  return null
}

const scriptEl = () =>
  document.getElementById('page-jsonld') as HTMLScriptElement | null

describe('useJsonLd', () => {
  it('injects a single ld+json script with the serialized data', () => {
    render(<Probe data={{ '@type': 'Course', name: 'X' }} />)
    const el = scriptEl()
    expect(el).not.toBeNull()
    expect(el!.type).toBe('application/ld+json')
    expect(JSON.parse(el!.textContent!)).toMatchObject({ '@type': 'Course', name: 'X' })
  })

  it('updates the same script when data changes (no duplicates)', () => {
    const { rerender } = render(<Probe data={{ name: 'A' }} />)
    rerender(<Probe data={{ name: 'B' }} />)
    expect(document.querySelectorAll('#page-jsonld').length).toBe(1)
    expect(JSON.parse(scriptEl()!.textContent!)).toMatchObject({ name: 'B' })
  })

  it('removes the script when data is null', () => {
    const { rerender } = render(<Probe data={{ name: 'A' }} />)
    expect(scriptEl()).not.toBeNull()
    rerender(<Probe data={null} />)
    expect(scriptEl()).toBeNull()
  })
})
