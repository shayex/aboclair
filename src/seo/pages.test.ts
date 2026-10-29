import { describe, expect, it } from 'vitest'
import { marques, trouverMarque } from '../lib/catalogue'
import { echapper, pageIndex, pageMarque, planDuSite } from './pages'

const ctx = { site: 'https://exemple.github.io/aboclair/', audience: '' }

describe('pages « Comment résilier »', () => {
  it('échappe le HTML', () => {
    expect(echapper('<a href="x">B&You</a>')).toBe('&lt;a href=&quot;x&quot;&gt;B&amp;You&lt;/a&gt;')
  })
  it('donne à chaque marque un titre, une adresse canonique et un lien de résiliation', () => {
    const html = pageMarque(trouverMarque('Basic-Fit')!, ctx)
    expect(html).toContain('<title>Comment résilier Basic-Fit en 2026 · AboClair</title>')
    expect(html).toContain('<link rel="canonical" href="https://exemple.github.io/aboclair/resilier/basic-fit/" />')
    expect(html).toContain('href="https://my.basic-fit.com/"')
    expect(html).toContain('<td>Comfort</td><td>29,99')
  })
  it('ne parle de l’App Store que pour les services vendus en appli', () => {
    expect(pageMarque(trouverMarque('Basic-Fit')!, ctx)).not.toContain('App Store')
    expect(pageMarque(trouverMarque('Netflix')!, ctx)).toContain('App Store')
  })
  it('échappe les noms de marque (B&You)', () => {
    expect(pageMarque(trouverMarque('Forfait B&You')!, ctx)).toContain('Forfait B&amp;You')
  })
  it('liste toutes les marques dans l’index et le plan du site', () => {
    const index = pageIndex(ctx)
    for (const m of marques) expect(index).toContain(`href="${m.slug}/"`)
    const plan = planDuSite(ctx, '2026-10-29')
    expect(plan.match(/<url>/g)).toHaveLength(marques.length + 2)
  })
  it('insère la mesure d’audience seulement si elle est fournie', () => {
    expect(pageIndex(ctx)).not.toContain('umami')
    expect(pageIndex({ ...ctx, audience: '<script src="u"></script>' })).toContain('<script src="u"></script>')
  })
})
