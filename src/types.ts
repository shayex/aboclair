export type Categorie =
  | 'video'
  | 'musique'
  | 'ia'
  | 'sport'
  | 'presse'
  | 'jeux'
  | 'cloud'
  | 'operateurs'

export type Frequence = 'mensuel' | 'annuel'
export type PayeVia = 'cb' | 'paypal' | 'app-store' | 'google-play' | 'facture-operateur' | 'autre'
export type Usage = 'souvent' | 'parfois' | 'jamais'
export type Verdict = 'garder' | 'pause' | 'couper' | 'partager'

/** Un service du catalogue (src/data/catalogue.json). Prix en euros. */
export interface ServiceCatalogue {
  id: string
  nom: string
  categorie: Categorie
  prixMensuelIndicatif: number
  /** Prix réellement facturé quand le service est payé à l'année. */
  prixAnnuelIndicatif?: number
  frequence: Frequence
  urlResiliation: string
  noteResiliation: string
  dateMiseAJourPrix: string
  /** Offre famille ou multi-comptes : le verdict « partager » est possible. */
  partageable: boolean
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
}

export interface DonneesAboClair {
  version: 1
  abonnements: Abonnement[]
  exporteLe?: string
}
