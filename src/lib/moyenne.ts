import type { Abonnement, Categorie } from '../types'
import { coutAnnuelCentimes } from './calculs'

/**
 * Dépense moyenne des Français en abonnements culturels en ligne.
 * Le périmètre de l'étude ne couvre ni les box, ni le sport, ni le cloud : on ne compare
 * donc que les catégories équivalentes.
 */
export const MOYENNE_FRANCAISE = {
  centimesParMois: 4100,
  source: 'BearingPoint, Submix 2026',
  url: 'https://fr.themedialeader.com/?p=215313',
  categories: ['video', 'musique', 'jeux', 'presse'] as Categorie[],
}

export interface Comparaison {
  /** Ta dépense mensuelle sur le même périmètre que l'étude. */
  mensuel: number
  ratio: number
  phrase: string
}

function nombre(n: number): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
}

export function comparerMoyenne(abonnements: Abonnement[]): Comparaison | null {
  const concernes = abonnements.filter((a) => MOYENNE_FRANCAISE.categories.includes(a.categorie as Categorie))
  if (concernes.length === 0) return null
  const mensuel = Math.round(concernes.reduce((s, a) => s + coutAnnuelCentimes(a), 0) / 12)
  const ratio = mensuel / MOYENNE_FRANCAISE.centimesParMois
  let phrase: string
  if (ratio >= 1.5) phrase = `${nombre(Math.round(ratio * 10) / 10)} fois la moyenne française`
  else if (ratio > 1.05) phrase = `${Math.round((ratio - 1) * 100)} % de plus que la moyenne française`
  else if (ratio >= 0.95) phrase = 'pile dans la moyenne française'
  else phrase = `${Math.round((1 - ratio) * 100)} % de moins que la moyenne française`
  return { mensuel, ratio, phrase }
}
