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

/** Prix catalogue en centimes pour la fréquence demandée. */
export function prixCatalogueCentimes(service: ServiceCatalogue, frequence: Frequence): number {
  if (frequence === 'annuel') {
    return Math.round((service.prixAnnuelIndicatif ?? service.prixMensuelIndicatif * 12) * 100)
  }
  return Math.round(service.prixMensuelIndicatif * 100)
}
