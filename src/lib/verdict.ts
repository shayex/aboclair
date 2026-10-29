import type { Abonnement, Usage, Verdict } from '../types'
import { coutAnnuelCentimes } from './calculs'
import { trouverService } from './catalogue'

/** Part du coût annuel économisée selon le verdict (hypothèses validées pour le MVP). */
export const TAUX_ECONOMIE: Record<Verdict, number> = {
  garder: 0,
  partager: 0.5, // partage à deux
  pause: 0.75, // on se réabonne 3 mois par an
  couper: 1,
}

export function verdictPour(usage: Usage, partageable: boolean): Verdict {
  if (usage === 'souvent') return 'garder'
  if (usage === 'jamais') return 'couper'
  return partageable ? 'partager' : 'pause'
}

export function estPartageable(a: Pick<Abonnement, 'serviceId'>): boolean {
  return trouverService(a.serviceId)?.partageable ?? false
}

export function economieAnnuelleCentimes(a: Pick<Abonnement, 'prixCentimes' | 'frequence'>, verdict: Verdict): number {
  return Math.round(coutAnnuelCentimes(a) * TAUX_ECONOMIE[verdict])
}

export interface LignePlan {
  abonnement: Abonnement
  verdict: Verdict
  economie: number
  /** L'action a été faite (résilié, partagé, mis en pause). */
  fait: boolean
}

export interface Plan {
  /** Actions à mener (hors « garder »), de la plus rentable à la moins rentable. */
  actions: LignePlan[]
  gardes: LignePlan[]
  economieTotale: number
  /** Économies des actions déjà faites. */
  economieFaite: number
  /** Abonnements dont l'usage n'a pas encore été renseigné. */
  restants: number
}

export function construirePlan(
  abonnements: Abonnement[],
  partageable: (a: Abonnement) => boolean = estPartageable,
): Plan {
  const lignes: LignePlan[] = abonnements.flatMap((a) => {
    if (!a.usage) return []
    const verdict = verdictPour(a.usage, partageable(a))
    return [{ abonnement: a, verdict, economie: economieAnnuelleCentimes(a, verdict), fait: Boolean(a.faitLe) }]
  })
  const actions = lignes.filter((l) => l.verdict !== 'garder').sort((x, y) => y.economie - x.economie)
  return {
    actions,
    gardes: lignes.filter((l) => l.verdict === 'garder'),
    economieTotale: actions.reduce((s, l) => s + l.economie, 0),
    economieFaite: actions.reduce((s, l) => s + (l.fait ? l.economie : 0), 0),
    restants: abonnements.length - lignes.length,
  }
}
