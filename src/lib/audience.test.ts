import { describe, expect, it } from 'vitest'
import { baliseAudience } from './audience'

describe('baliseAudience', () => {
  const id = '3f2b6c1e-8a4d-4c7b-9e2f-1a2b3c4d5e6f'
  it('ne produit rien sans identifiant, ou avec un identifiant invalide', () => {
    expect(baliseAudience(undefined)).toBe('')
    expect(baliseAudience('"><script>')).toBe('')
  })
  it('respecte « ne pas me suivre » et se limite au domaine du site', () => {
    const b = baliseAudience(id, 'https://shayex.github.io/aboclair/')
    expect(b).toContain(`data-website-id="${id}"`)
    expect(b).toContain('data-do-not-track="true"')
    expect(b).toContain('data-domains="shayex.github.io"')
  })
})
