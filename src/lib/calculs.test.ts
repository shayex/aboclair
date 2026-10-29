import { describe, expect, it } from 'vitest'
import type { ServiceCatalogue } from '../types'
import {
  centimesVersSaisie,
  convertirPrix,
  coutAnnuelCentimes,
  coutMensuelCentimes,
  eurosVersCentimes,
  prixApresChangementFrequence,
  totaux,
} from './calculs'

describe('coûts', () => {
  it('multiplie un prix mensuel par 12 pour le coût annuel', () => {
    expect(coutAnnuelCentimes({ prixCentimes: 1499, frequence: 'mensuel' })).toBe(17988)
  })
  it('garde un prix annuel tel quel', () => {
    expect(coutAnnuelCentimes({ prixCentimes: 7199, frequence: 'annuel' })).toBe(7199)
  })
  it('divise un prix annuel par 12, arrondi au centime', () => {
    expect(coutMensuelCentimes({ prixCentimes: 7199, frequence: 'annuel' })).toBe(600)
    expect(coutMensuelCentimes({ prixCentimes: 9900, frequence: 'annuel' })).toBe(825)
  })
})

describe('totaux', () => {
  it('vaut zéro sans abonnement', () => {
    expect(totaux([])).toEqual({ mensuel: 0, annuel: 0, dixAns: 0 })
  })
  it('additionne mensuels et annuels sans cumuler les arrondis', () => {
    const t = totaux([
      { prixCentimes: 1499, frequence: 'mensuel' },
      { prixCentimes: 1214, frequence: 'mensuel' },
      { prixCentimes: 7199, frequence: 'annuel' },
      { prixCentimes: 1999, frequence: 'annuel' },
    ])
    expect(t.annuel).toBe(17988 + 14568 + 7199 + 1999)
    expect(t.mensuel).toBe(Math.round(41754 / 12))
    expect(t.dixAns).toBe(417540)
  })
})

describe('convertirPrix', () => {
  it('passe de mensuel à annuel et inversement', () => {
    expect(convertirPrix(699, 'mensuel', 'annuel')).toBe(8388)
    expect(convertirPrix(8388, 'annuel', 'mensuel')).toBe(699)
    expect(convertirPrix(1000, 'annuel', 'mensuel')).toBe(83)
  })
  it('ne change rien si la fréquence est la même', () => {
    expect(convertirPrix(1299, 'mensuel', 'mensuel')).toBe(1299)
  })
})

describe('prixApresChangementFrequence', () => {
  const ps: ServiceCatalogue = {
    id: 'ps',
    nom: 'PS Plus',
    categorie: 'jeux',
    prixMensuelIndicatif: 6,
    prixAnnuelIndicatif: 71.99,
    frequence: 'annuel',
    urlResiliation: 'https://exemple.fr',
    noteResiliation: '',
    dateMiseAJourPrix: '2026-10-29',
    partageable: false,
  }
  it('reprend le prix catalogue si le prix n’a pas été modifié', () => {
    expect(prixApresChangementFrequence({ prixCentimes: 7199, frequence: 'annuel' }, 'mensuel', ps)).toBe(600)
    expect(prixApresChangementFrequence({ prixCentimes: 600, frequence: 'mensuel' }, 'annuel', ps)).toBe(7199)
  })
  it('convertit le prix saisi par l’utilisateur', () => {
    expect(prixApresChangementFrequence({ prixCentimes: 6000, frequence: 'annuel' }, 'mensuel', ps)).toBe(500)
  })
})

describe('saisie des montants', () => {
  it.each([
    ['12,99', 1299],
    ['12.99', 1299],
    ['12', 1200],
    ['12,5', 1250],
    [' 1 234,50 € ', 123450],
    ['0', 0],
  ])('lit « %s »', (saisie, attendu) => {
    expect(eurosVersCentimes(saisie)).toBe(attendu)
  })
  it.each(['', 'abc', '12,999', '-5', '12,,5', '1e3'])('refuse « %s »', (saisie) => {
    expect(eurosVersCentimes(saisie)).toBeNull()
  })
  it('pré-remplit le champ au format français', () => {
    expect(centimesVersSaisie(1299)).toBe('12,99')
    expect(centimesVersSaisie(1200)).toBe('12,00')
  })
})
