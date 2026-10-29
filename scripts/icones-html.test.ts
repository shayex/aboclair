import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import manifeste from '../src/data/logos.json'
import { marques } from '../src/lib/catalogue'
import { ICONES } from '../src/lib/logos'
import { iconesDeclarees } from './icones-html'
import { EXCLUES, SITES } from './sites-des-marques'

describe('iconesDeclarees', () => {
  const html = `<head>
    <link rel="icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/f32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="https://cdn.exemple.fr/apple.png">
    <link rel="stylesheet" href="/style.css">
    <link href="/logo.svg" rel="icon" type="image/svg+xml">
  </head>`
  it('préfère l’icône d’écran d’accueil, puis le SVG, et met le .ico en dernier', () => {
    expect(iconesDeclarees(html, 'https://www.exemple.fr/')).toEqual([
      'https://cdn.exemple.fr/apple.png',
      'https://www.exemple.fr/logo.svg',
      'https://www.exemple.fr/f32.png',
      'https://www.exemple.fr/favicon.ico',
    ])
  })
  it('ne renvoie rien sans icône', () => {
    expect(iconesDeclarees('<link rel="stylesheet" href="a.css">', 'https://x.fr/')).toEqual([])
  })
})

describe('logos récupérés', () => {
  it('visitent exactement les marques sans icône Simple Icons, hors exclusions', () => {
    const sansIcone = marques.map((m) => m.nom).filter((n) => !ICONES[n] && !EXCLUES[n]).sort()
    expect(Object.keys(SITES).sort()).toEqual(sansIcone)
  })
  it('n’affichent aucune marque exclue', () => {
    for (const nom of Object.keys(EXCLUES)) expect(Object.keys(manifeste)).not.toContain(nom)
  })
  it('pointent vers des fichiers présents dans public/', () => {
    for (const { fichier } of Object.values(manifeste as Record<string, { fichier: string }>)) {
      expect(existsSync(`public/${fichier}`)).toBe(true)
    }
  })
})
