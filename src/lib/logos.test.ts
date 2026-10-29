import { describe, expect, it } from 'vitest'
import { marques } from './catalogue'
import { ICONES, initiales, logoPour, luminance } from './logos'

describe('logos', () => {
  it('ne référence que des marques du catalogue (un renommage ne passe pas inaperçu)', () => {
    const noms = new Set(marques.map((m) => m.nom))
    for (const nom of Object.keys(ICONES)) expect(noms).toContain(nom)
  })
  it('donne un visuel à chaque marque', () => {
    for (const m of marques) expect(logoPour(m.nom)).toBeTruthy()
  })
  it('choisit un glyphe lisible sur le fond de la marque', () => {
    const spotify = logoPour('Spotify')
    const netflix = logoPour('Netflix')
    expect(spotify.type === 'icone' && spotify.glyphe).toBe('#000000')
    expect(netflix.type === 'icone' && netflix.glyphe).toBe('#ffffff')
    expect(luminance('ffffff')).toBeCloseTo(1)
    expect(luminance('000000')).toBe(0)
  })
  it.each([
    ['Basic-Fit', 'BF'],
    ['Canal+', 'C+'],
    ['Disney+', 'D+'],
    ['Box SFR', 'S'],
    ['Forfait RED by SFR', 'RS'],
    ['Forfait B&You', 'BY'],
    ['Le Monde', 'M'],
    ['Box Bouygues Telecom (Bbox)', 'BT'],
    ['salle d’escalade', 'SE'],
    ['', '?'],
  ])('initiales de « %s » : %s', (nom, attendu) => {
    expect(initiales(nom)).toBe(attendu)
  })
})
