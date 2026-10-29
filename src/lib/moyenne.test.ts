import { describe, expect, it } from 'vitest'
import type { Abonnement } from '../types'
import { comparerMoyenne } from './moyenne'

const abo = (categorie: Abonnement['categorie'], prixCentimes: number): Abonnement => ({
  id: Math.random().toString(36),
  serviceId: null,
  nom: 'x',
  categorie,
  prixCentimes,
  frequence: 'mensuel',
})

describe('comparerMoyenne', () => {
  it('ne compare rien sans abonnement culturel', () => {
    expect(comparerMoyenne([])).toBeNull()
    expect(comparerMoyenne([abo('operateurs', 3999), abo('sport', 2999)])).toBeNull()
  })
  it('ignore les catégories hors du périmètre de l’étude', () => {
    expect(comparerMoyenne([abo('video', 4100), abo('operateurs', 3999)])!.mensuel).toBe(4100)
  })
  it.each([
    [9200, '2,2 fois la moyenne française'],
    [8200, '2 fois la moyenne française'],
    [5200, '27 % de plus que la moyenne française'],
    [4100, 'pile dans la moyenne française'],
    [2050, '50 % de moins que la moyenne française'],
  ])('%i centimes par mois → « %s »', (centimes, phrase) => {
    expect(comparerMoyenne([abo('video', centimes)])!.phrase).toBe(phrase)
  })
})
