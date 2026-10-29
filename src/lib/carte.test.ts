import { describe, expect, it } from 'vitest'
import { texteCarte } from './carte'

describe('texteCarte', () => {
  it('annonce le potentiel quand rien n’est encore fait', () => {
    const t = texteCarte(65700, 0, 'https://exemple.fr/')
    expect([t.avant, t.montant, t.apres]).toEqual(['J’ai trouvé', '657 €', 'd’économies par an'])
    expect(t.partage).toContain('https://exemple.fr/')
  })
  it('annonce les économies réalisées dès qu’il y en a', () => {
    const t = texteCarte(65700, 39000, 'https://exemple.fr/')
    expect(t.avant).toBe('J’ai économisé')
    expect(t.montant).toBe('390 €')
  })
})
