import { useEffect, useReducer, useState } from 'react'
import { prixCatalogueCentimes } from '../lib/catalogue'
import { charger, sauvegarder } from '../lib/stockage'
import type { Abonnement, DonneesAboClair, ServiceCatalogue } from '../types'

type Action =
  | { type: 'ajouter'; abonnement: Abonnement }
  | { type: 'modifier'; id: string; changements: Partial<Abonnement> }
  | { type: 'supprimer'; id: string }
  | { type: 'remplacer'; donnees: DonneesAboClair }

function reducteur(etat: DonneesAboClair, action: Action): DonneesAboClair {
  switch (action.type) {
    case 'ajouter':
      return { ...etat, abonnements: [...etat.abonnements, action.abonnement] }
    case 'modifier':
      return {
        ...etat,
        abonnements: etat.abonnements.map((a) =>
          a.id === action.id ? { ...a, ...action.changements } : a,
        ),
      }
    case 'supprimer':
      return { ...etat, abonnements: etat.abonnements.filter((a) => a.id !== action.id) }
    case 'remplacer':
      return action.donnees
  }
}

export function nouvelId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function depuisCatalogue(service: ServiceCatalogue): Abonnement {
  return {
    id: nouvelId(),
    serviceId: service.id,
    nom: service.nom,
    categorie: service.categorie,
    prixCentimes: prixCatalogueCentimes(service, service.frequence),
    frequence: service.frequence,
  }
}

export function useAbonnements() {
  const [donnees, dispatch] = useReducer(reducteur, undefined, charger)

  const [stockageOk, setStockageOk] = useState(true)

  useEffect(() => {
    setStockageOk(sauvegarder(donnees))
  }, [donnees])

  return {
    donnees,
    stockageOk,
    abonnements: donnees.abonnements,
    ajouter: (abonnement: Abonnement) => dispatch({ type: 'ajouter', abonnement }),
    modifier: (id: string, changements: Partial<Abonnement>) =>
      dispatch({ type: 'modifier', id, changements }),
    supprimer: (id: string) => dispatch({ type: 'supprimer', id }),
    remplacer: (d: DonneesAboClair) => dispatch({ type: 'remplacer', donnees: d }),
  }
}

export type GestionAbonnements = ReturnType<typeof useAbonnements>
