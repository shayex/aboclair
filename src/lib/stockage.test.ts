import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DonneesAboClair } from '../types'
import { charger, CLE_STOCKAGE, donneesVides, lireJson, migrer, sauvegarder, versJson } from './stockage'

const exemple: DonneesAboClair = {
  version: 1,
  abonnements: [
    {
      id: 'a1',
      serviceId: 'netflix-standard',
      nom: 'Netflix Standard',
      categorie: 'video',
      prixCentimes: 1499,
      frequence: 'mensuel',
      dateRenouvellement: '2026-11-20',
      payeVia: 'cb',
      usage: 'parfois',
    },
    { id: 'a2', serviceId: null, nom: 'Escalade', categorie: 'autre', prixCentimes: 42000, frequence: 'annuel' },
  ],
}

describe('export puis import', () => {
  it('retrouve exactement les mêmes abonnements', () => {
    const json = versJson(exemple, new Date('2026-10-29T10:00:00Z'))
    expect(JSON.parse(json).exporteLe).toBe('2026-10-29T10:00:00.000Z')
    expect(lireJson(json)).toEqual({ ok: true, donnees: exemple })
  })
})

describe('lireJson refuse les fichiers abîmés', () => {
  const avec = (changement: object) =>
    JSON.stringify({ ...exemple, abonnements: [{ ...exemple.abonnements[0], ...changement }] })

  it.each([
    ['du texte qui n’est pas du JSON', 'pas du json', /JSON valide/],
    ['un tableau', '[]', /AboClair/],
    ['une autre version', JSON.stringify({ version: 2, abonnements: [] }), /version/],
    ['un prix négatif', avec({ prixCentimes: -5 }), /n° 1/],
    ['un prix à virgule', avec({ prixCentimes: 12.5 }), /n° 1/],
    ['une fréquence inconnue', avec({ frequence: 'hebdo' }), /n° 1/],
    ['une date mal écrite', avec({ dateRenouvellement: '20/11/2026' }), /n° 1/],
    ['un nom vide', avec({ nom: '  ' }), /n° 1/],
    ['un moyen de paiement inconnu', avec({ payeVia: 'chèque' }), /n° 1/],
    [
      'deux fois le même identifiant',
      JSON.stringify({ version: 1, abonnements: [exemple.abonnements[0], exemple.abonnements[0]] }),
      /deux fois/,
    ],
  ])('%s', (_, texte, erreur) => {
    const r = lireJson(texte)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erreur).toMatch(erreur)
  })
})

describe('migrer', () => {
  const bf = { id: 'x', serviceId: 'basic-fit', nom: 'Basic-Fit Comfort', categorie: 'sport' as const, prixCentimes: 2999 }
  it('passe Basic-Fit à 4 semaines si le prix est celui du catalogue', () => {
    const d = migrer({ version: 1, abonnements: [{ ...bf, frequence: 'mensuel' }] })
    expect(d.abonnements[0].frequence).toBe('4-semaines')
  })
  it('ne touche pas un prix modifié ni les autres abonnements', () => {
    const d = migrer({ version: 1, abonnements: [{ ...bf, prixCentimes: 2499, frequence: 'mensuel' }, exemple.abonnements[0]] })
    expect(d.abonnements[0].frequence).toBe('mensuel')
    expect(d.abonnements[1]).toEqual(exemple.abonnements[0])
  })
})

describe('stockage local', () => {
  let memoire: Record<string, string>
  beforeEach(() => {
    memoire = {}
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => memoire[k] ?? null,
      setItem: (k: string, v: string) => {
        memoire[k] = v
      },
    })
  })
  afterEach(() => vi.unstubAllGlobals())

  it('sauvegarde puis recharge', () => {
    expect(sauvegarder(exemple)).toBe(true)
    expect(charger()).toEqual(exemple)
  })
  it('repart de zéro si le contenu est illisible', () => {
    memoire[CLE_STOCKAGE] = '{oups'
    expect(charger()).toEqual(donneesVides())
  })
  it('ne plante pas si le stockage est bloqué', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('bloqué')
      },
      setItem: () => {
        throw new Error('bloqué')
      },
    })
    expect(charger()).toEqual(donneesVides())
    expect(sauvegarder(exemple)).toBe(false)
  })
})
