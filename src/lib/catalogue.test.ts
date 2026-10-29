import { describe, expect, it } from 'vitest'
import { CATEGORIES, catalogue, marques, prixCatalogueCentimes, slugifier, trouverMarque } from './catalogue'

describe('catalogue', () => {
  it('contient des offres aux identifiants uniques', () => {
    expect(catalogue.length).toBeGreaterThanOrEqual(45)
    expect(new Set(catalogue.map((s) => s.id)).size).toBe(catalogue.length)
  })
  it('couvre toutes les catégories', () => {
    for (const c of CATEGORIES) expect(catalogue.some((s) => s.categorie === c.id)).toBe(true)
  })
  it.each(catalogue.map((s) => [s.id, s] as const))('%s a des données complètes', (_, s) => {
    expect(s.marque.trim()).not.toBe('')
    expect(s.nom).toBe(s.offre ? `${s.marque} ${s.offre}` : s.marque)
    expect(s.prixIndicatif).toBeGreaterThan(0)
    expect(['mensuel', '4-semaines', 'annuel']).toContain(s.frequence)
    expect(s.urlResiliation).toMatch(/^https:\/\//)
    expect(s.noteResiliation.trim()).not.toBe('')
    expect(s.noteResiliation).not.toContain("'")
    expect(s.dateMiseAJourPrix).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
  it('donne le prix catalogue exact dans sa propre fréquence', () => {
    const ps = catalogue.find((s) => s.id === 'ps-plus')!
    expect(prixCatalogueCentimes(ps)).toBe(7199)
    expect(prixCatalogueCentimes(ps, 'mensuel')).toBe(600)
  })
})

describe('marques', () => {
  it('regroupe les offres d’une même marque, dans une seule catégorie', () => {
    const bf = trouverMarque('Basic-Fit')!
    expect(bf.offres.map((o) => o.offre)).toEqual(['Basic', 'Comfort', 'Premium'])
    for (const m of marques) expect(new Set(m.offres.map((o) => o.categorie)).size).toBe(1)
  })
  it('donne à chaque marque une adresse unique', () => {
    expect(new Set(marques.map((m) => m.slug)).size).toBe(marques.length)
    expect(slugifier('Disney+')).toBe('disney-plus')
    expect(slugifier('L’Équipe')).toBe('l-equipe')
  })
  it('met en avant une dizaine de marques courantes', () => {
    const populaires = marques.filter((m) => m.populaire).length
    expect(populaires).toBeGreaterThanOrEqual(8)
    expect(populaires).toBeLessThanOrEqual(12)
  })
})
