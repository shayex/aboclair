export type Categorie =
  | 'video'
  | 'musique'
  | 'ia'
  | 'sport'
  | 'presse'
  | 'jeux'
  | 'cloud'
  | 'operateurs'

export type Frequence = 'mensuel' | '4-semaines' | 'annuel'
export type PayeVia = 'cb' | 'paypal' | 'app-store' | 'google-play' | 'facture-operateur' | 'autre'
export type Usage = 'souvent' | 'parfois' | 'jamais'
export type Verdict = 'garder' | 'pause' | 'couper' | 'partager'

/** Une offre du catalogue (src/data/catalogue.json). Prix en euros. */
export interface ServiceCatalogue {
  id: string
  /** Nom commercial commun à toutes les offres (« Basic-Fit »). */
  marque: string
  /** Nom de l'offre (« Comfort »), absent quand la marque n'en a qu'une. */
  offre?: string
  /** Marque + offre (« Basic-Fit Comfort »). */
  nom: string
  categorie: Categorie
  /** Montant facturé à chaque prélèvement, selon la fréquence. */
  prixIndicatif: number
  frequence: Frequence
  urlResiliation: string
  noteResiliation: string
  dateMiseAJourPrix: string
  /** Offre famille ou multi-comptes : le verdict « partager » est possible. */
  partageable: boolean
  /** Affiché dans « Les plus courants ». */
  populaire?: boolean
}

/** Un abonnement de l'utilisateur, stocké dans le navigateur. */
export interface Abonnement {
  id: string
  /** null = abonnement personnalisé, hors catalogue */
  serviceId: string | null
  nom: string
  categorie: Categorie | 'autre'
  /** Montant payé à chaque prélèvement, en centimes. */
  prixCentimes: number
  frequence: Frequence
  dateRenouvellement?: string
  payeVia?: PayeVia
  finEssai?: string
  usage?: Usage
  /** Date à laquelle l'action du plan (résilier, partager…) a été faite. */
  faitLe?: string
}

export interface DonneesAboClair {
  version: 1
  abonnements: Abonnement[]
  exporteLe?: string
}
