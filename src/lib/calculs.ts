import type { Abonnement, Frequence, ServiceCatalogue } from '../types'
import { convertirPrix, PRELEVEMENTS_PAR_AN, prixCatalogueCentimes } from './catalogue'

export { convertirPrix }

type Prix = Pick<Abonnement, 'prixCentimes' | 'frequence'>

export function coutAnnuelCentimes(a: Prix): number {
  return a.prixCentimes * PRELEVEMENTS_PAR_AN[a.frequence]
}

export function coutMensuelCentimes(a: Prix): number {
  return Math.round(coutAnnuelCentimes(a) / 12)
}

export interface Totaux {
  mensuel: number
  annuel: number
  dixAns: number
}

/** Les totaux partent du coût annuel exact, puis on divise : pas d'arrondi qui s'accumule. */
export function totaux(abonnements: Prix[]): Totaux {
  const annuel = abonnements.reduce((somme, a) => somme + coutAnnuelCentimes(a), 0)
  return { mensuel: Math.round(annuel / 12), annuel, dixAns: annuel * 10 }
}

/**
 * Prix proposé quand l'utilisateur change de fréquence : on garde le même coût annuel.
 * Si le prix est encore celui du catalogue, on repart du prix catalogue pour éviter
 * d'accumuler des arrondis en passant d'une fréquence à l'autre.
 */
export function prixApresChangementFrequence(
  a: Prix,
  vers: Frequence,
  service?: ServiceCatalogue,
): number {
  if (service && a.prixCentimes === prixCatalogueCentimes(service, a.frequence)) {
    return prixCatalogueCentimes(service, vers)
  }
  return convertirPrix(a.prixCentimes, a.frequence, vers)
}

/** « 12,99 », « 12.99 », « 12 € » → 1299. Renvoie null si la saisie n'est pas un montant. */
export function eurosVersCentimes(saisie: string): number | null {
  const propre = saisie.replace(/[\s  €]/g, '').replace(',', '.')
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(propre)) return null
  return Math.round(Number(propre) * 100)
}

/** 1299 → « 12,99 » pour pré-remplir un champ. */
export function centimesVersSaisie(centimes: number): string {
  return (centimes / 100).toFixed(2).replace('.', ',')
}
