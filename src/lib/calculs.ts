import type { Abonnement, Frequence, ServiceCatalogue } from '../types'
import { prixCatalogueCentimes } from './catalogue'

type Prix = Pick<Abonnement, 'prixCentimes' | 'frequence'>

export function coutAnnuelCentimes(a: Prix): number {
  return a.frequence === 'mensuel' ? a.prixCentimes * 12 : a.prixCentimes
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

export function convertirPrix(centimes: number, de: Frequence, vers: Frequence): number {
  if (de === vers) return centimes
  return vers === 'annuel' ? centimes * 12 : Math.round(centimes / 12)
}

/**
 * Prix proposé quand l'utilisateur change de fréquence. Si le prix est encore celui du
 * catalogue, on reprend le prix catalogue de l'autre fréquence (une offre annuelle coûte
 * souvent moins que 12 mois). Sinon on convertit simplement.
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
