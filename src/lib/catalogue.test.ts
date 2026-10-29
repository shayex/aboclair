import { describe, expect, it } from 'vitest'
import { CATEGORIES, catalogue, prixCatalogueCentimes } from './catalogue'

describe('catalogue', () => {
  it('contient une cinquantaine de services aux identifiants uniques', () => {
    expect(catalogue.length).toBeGreaterThanOrEqual(45)
    expect(new Set(catalogue.map((s) => s.id)).size).toBe(catalogue.length)
  })
  it('couvre toutes les catégories', () => {
    for (const c of CATEGORIES) expect(catalogue.some((s) => s.categorie === c.id)).toBe(true)
  })
  it.each(catalogue.map((s) => [s.id, s] as const))('%s a des données complètes', (_, s) => {
    expect(s.nom.trim()).not.toBe('')
    expect(s.prixMensuelIndicatif).toBeGreaterThan(0)
    expect(s.urlResiliation).toMatch(/^https:\/\//)
    expect(s.noteResiliation.trim()).not.toBe('')
    expect(s.dateMiseAJourPrix).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    if (s.frequence === 'annuel') expect(s.prixAnnuelIndicatif).toBeGreaterThan(0)
  })
  it('donne un prix annuel cohérent avec le prix mensuel affiché', () => {
    for (const s of catalogue.filter((x) => x.prixAnnuelIndicatif)) {
      expect(Math.abs(prixCatalogueCentimes(s, 'annuel') / 12 - prixCatalogueCentimes(s, 'mensuel'))).toBeLessThan(1)
    }
  })
})
