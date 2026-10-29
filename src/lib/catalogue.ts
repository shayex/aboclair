import donnees from '../data/catalogue.json'
import type { Categorie, Frequence, ServiceCatalogue } from '../types'

export const catalogue = donnees as ServiceCatalogue[]

const parId = new Map(catalogue.map((s) => [s.id, s]))

export function trouverService(id: string | null): ServiceCatalogue | undefined {
  return id ? parId.get(id) : undefined
}

export const CATEGORIES: { id: Categorie; libelle: string }[] = [
  { id: 'video', libelle: 'Vidéo' },
  { id: 'musique', libelle: 'Musique et audio' },
  { id: 'ia', libelle: 'IA' },
  { id: 'sport', libelle: 'Sport' },
  { id: 'presse', libelle: 'Presse et lecture' },
  { id: 'jeux', libelle: 'Jeux' },
  { id: 'cloud', libelle: 'Cloud' },
  { id: 'operateurs', libelle: 'Opérateurs' },
]

export function libelleCategorie(id: Categorie | 'autre'): string {
  return CATEGORIES.find((c) => c.id === id)?.libelle ?? 'Autre'
}

/** Une marque et toutes ses offres, dans l'ordre du catalogue. */
export interface Marque {
  nom: string
  slug: string
  categorie: Categorie
  populaire: boolean
  offres: ServiceCatalogue[]
}

export function slugifier(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\+/g, '-plus')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const marques: Marque[] = (() => {
  const parNom = new Map<string, Marque>()
  for (const s of catalogue) {
    let m = parNom.get(s.marque)
    if (!m) {
      m = { nom: s.marque, slug: slugifier(s.marque), categorie: s.categorie, populaire: false, offres: [] }
      parNom.set(s.marque, m)
    }
    m.offres.push(s)
    m.populaire ||= Boolean(s.populaire)
  }
  return [...parNom.values()]
})()

export function trouverMarque(nom: string): Marque | undefined {
  return marques.find((m) => m.nom === nom)
}

/** Nombre de prélèvements par an pour chaque fréquence. */
export const PRELEVEMENTS_PAR_AN: Record<Frequence, number> = {
  mensuel: 12,
  '4-semaines': 13,
  annuel: 1,
}

/** Convertit un montant d'une fréquence à l'autre, à coût annuel égal. */
export function convertirPrix(centimes: number, de: Frequence, vers: Frequence): number {
  if (de === vers) return centimes
  return Math.round((centimes * PRELEVEMENTS_PAR_AN[de]) / PRELEVEMENTS_PAR_AN[vers])
}

/** Prix catalogue en centimes pour la fréquence demandée. */
export function prixCatalogueCentimes(service: ServiceCatalogue, frequence: Frequence = service.frequence): number {
  return convertirPrix(Math.round(service.prixIndicatif * 100), service.frequence, frequence)
}
