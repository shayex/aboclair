import { describe, expect, it } from 'vitest'
import { formaterDate, formaterEuros, normaliser } from './format'

describe('format', () => {
  it('écrit les montants à la française', () => {
    expect(formaterEuros(1299)).toBe('12,99 €')
    expect(formaterEuros(163188, true)).toBe('1 632 €')
  })
  it('écrit les dates en toutes lettres', () => {
    expect(formaterDate('2026-11-12')).toBe('12 novembre 2026')
  })
  it('ignore accents, majuscules et type d’apostrophe pour la recherche', () => {
    expect(normaliser('L’Équipe')).toBe("l'equipe")
    expect(normaliser(" l'equipe ")).toBe("l'equipe")
  })
})
