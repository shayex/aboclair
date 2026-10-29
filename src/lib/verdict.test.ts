import { describe, expect, it } from 'vitest'
import type { Abonnement } from '../types'
import { construirePlan, economieAnnuelleCentimes, estPartageable, verdictPour } from './verdict'

function abo(partiel: Partial<Abonnement>): Abonnement {
  return {
    id: Math.random().toString(36),
    serviceId: null,
    nom: 'Test',
    categorie: 'autre',
    prixCentimes: 1000,
    frequence: 'mensuel',
    ...partiel,
  }
}

describe('verdictPour', () => {
  it('garde ce qui sert souvent', () => {
    expect(verdictPour('souvent', true)).toBe('garder')
    expect(verdictPour('souvent', false)).toBe('garder')
  })
  it('coupe ce qui ne sert jamais', () => {
    expect(verdictPour('jamais', true)).toBe('couper')
  })
  it('propose le partage si le service le permet, sinon la pause', () => {
    expect(verdictPour('parfois', true)).toBe('partager')
    expect(verdictPour('parfois', false)).toBe('pause')
  })
})

describe('economieAnnuelleCentimes', () => {
  const netflix = { prixCentimes: 1499, frequence: 'mensuel' as const } // 179,88 €/an
  it('applique les taux validés', () => {
    expect(economieAnnuelleCentimes(netflix, 'garder')).toBe(0)
    expect(economieAnnuelleCentimes(netflix, 'partager')).toBe(8994)
    expect(economieAnnuelleCentimes(netflix, 'pause')).toBe(13491)
    expect(economieAnnuelleCentimes(netflix, 'couper')).toBe(17988)
  })
  it('fonctionne avec un prix annuel', () => {
    expect(economieAnnuelleCentimes({ prixCentimes: 7199, frequence: 'annuel' }, 'couper')).toBe(7199)
  })
})

describe('estPartageable', () => {
  it('lit le catalogue, et considère un abonnement personnalisé comme non partageable', () => {
    expect(estPartageable({ serviceId: 'spotify' })).toBe(true)
    expect(estPartageable({ serviceId: 'chatgpt-plus' })).toBe(false)
    expect(estPartageable({ serviceId: null })).toBe(false)
  })
})

describe('construirePlan', () => {
  it('trie les actions par économie et ignore les abonnements sans réponse', () => {
    const plan = construirePlan(
      [
        abo({ nom: 'A', usage: 'jamais', prixCentimes: 500 }), // 60 €
        abo({ nom: 'B', usage: 'souvent' }),
        abo({ nom: 'C', usage: 'parfois', prixCentimes: 2000 }), // pause : 180 €
        abo({ nom: 'D' }),
      ],
      () => false,
    )
    expect(plan.actions.map((l) => l.abonnement.nom)).toEqual(['C', 'A'])
    expect(plan.gardes.map((l) => l.abonnement.nom)).toEqual(['B'])
    expect(plan.economieTotale).toBe(18000 + 6000)
    expect(plan.restants).toBe(1)
  })
  it('compte les économies déjà réalisées, sans tenir compte d’un « fait » sur un abonnement gardé', () => {
    const plan = construirePlan(
      [
        abo({ usage: 'jamais', prixCentimes: 500, faitLe: '2026-10-29' }), // 60 € faits
        abo({ usage: 'parfois', prixCentimes: 2000 }), // 180 € possibles
        abo({ usage: 'souvent', faitLe: '2026-10-29' }),
      ],
      () => false,
    )
    expect(plan.economieTotale).toBe(24000)
    expect(plan.economieFaite).toBe(6000)
  })
  it('est vide sans abonnement', () => {
    expect(construirePlan([])).toEqual({ actions: [], gardes: [], economieTotale: 0, economieFaite: 0, restants: 0 })
  })
})
