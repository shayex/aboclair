import type { PayeVia, Usage, Verdict } from '../types'

export const PAYE_VIA: { valeur: PayeVia; libelle: string }[] = [
  { valeur: 'cb', libelle: 'Carte bancaire' },
  { valeur: 'paypal', libelle: 'PayPal' },
  { valeur: 'app-store', libelle: 'App Store' },
  { valeur: 'google-play', libelle: 'Google Play' },
  { valeur: 'facture-operateur', libelle: 'Facture opérateur' },
  { valeur: 'autre', libelle: 'Autre' },
]

export function libellePayeVia(v: PayeVia): string {
  return PAYE_VIA.find((p) => p.valeur === v)?.libelle ?? 'Autre'
}

export const USAGES: { valeur: Usage; libelle: string }[] = [
  { valeur: 'souvent', libelle: 'Souvent' },
  { valeur: 'parfois', libelle: 'Parfois' },
  { valeur: 'jamais', libelle: 'Jamais' },
]

export const VERDICTS: Record<Verdict, { libelle: string; couleur: string }> = {
  garder: { libelle: 'Garder', couleur: 'text-garder bg-garder/12' },
  partager: { libelle: 'Partager', couleur: 'text-partager bg-partager/12' },
  pause: { libelle: 'Mettre en pause', couleur: 'text-pause bg-pause/12' },
  couper: { libelle: 'Couper', couleur: 'text-couper bg-couper/12' },
}
