import type { Abonnement, DonneesAboClair } from '../types'
import { trouverService } from './catalogue'

export const CLE_STOCKAGE = 'aboclair:v1'

const CATEGORIES = ['video', 'musique', 'ia', 'sport', 'presse', 'jeux', 'cloud', 'operateurs', 'autre']
const FREQUENCES = ['mensuel', '4-semaines', 'annuel']
const PAYE_VIA = ['cb', 'paypal', 'app-store', 'google-play', 'facture-operateur', 'autre']
const USAGES = ['souvent', 'parfois', 'jamais']
const DATE_ISO = /^\d{4}-\d{2}-\d{2}$/

export function donneesVides(): DonneesAboClair {
  return { version: 1, abonnements: [] }
}

function estChaine(v: unknown): v is string {
  return typeof v === 'string'
}

function dateOptionnelle(v: unknown): boolean {
  return v === undefined || (estChaine(v) && DATE_ISO.test(v))
}

function valeurOptionnelle(v: unknown, permises: string[]): boolean {
  return v === undefined || (estChaine(v) && permises.includes(v))
}

export function estAbonnement(v: unknown): v is Abonnement {
  if (typeof v !== 'object' || v === null) return false
  const a = v as Record<string, unknown>
  return (
    estChaine(a.id) &&
    a.id.length > 0 &&
    (a.serviceId === null || estChaine(a.serviceId)) &&
    estChaine(a.nom) &&
    a.nom.trim().length > 0 &&
    estChaine(a.categorie) &&
    CATEGORIES.includes(a.categorie) &&
    typeof a.prixCentimes === 'number' &&
    Number.isInteger(a.prixCentimes) &&
    a.prixCentimes >= 0 &&
    estChaine(a.frequence) &&
    FREQUENCES.includes(a.frequence) &&
    dateOptionnelle(a.dateRenouvellement) &&
    dateOptionnelle(a.finEssai) &&
    dateOptionnelle(a.faitLe) &&
    valeurOptionnelle(a.payeVia, PAYE_VIA) &&
    valeurOptionnelle(a.usage, USAGES)
  )
}

export type ResultatImport =
  | { ok: true; donnees: DonneesAboClair }
  | { ok: false; erreur: string }

/** Lit un export JSON et vérifie chaque champ avant de l'accepter. */
export function lireJson(texte: string): ResultatImport {
  let brut: unknown
  try {
    brut = JSON.parse(texte)
  } catch {
    return { ok: false, erreur: 'Ce fichier n’est pas un fichier JSON valide.' }
  }
  if (typeof brut !== 'object' || brut === null) {
    return { ok: false, erreur: 'Ce fichier ne contient pas de données AboClair.' }
  }
  const d = brut as Record<string, unknown>
  if (d.version !== 1 || !Array.isArray(d.abonnements)) {
    return { ok: false, erreur: 'Ce fichier ne vient pas d’AboClair ou sa version n’est pas reconnue.' }
  }
  const invalide = d.abonnements.findIndex((a) => !estAbonnement(a))
  if (invalide !== -1) {
    return { ok: false, erreur: `L’abonnement n° ${invalide + 1} du fichier est incomplet ou abîmé.` }
  }
  const ids = new Set(d.abonnements.map((a) => (a as Abonnement).id))
  if (ids.size !== d.abonnements.length) {
    return { ok: false, erreur: 'Le fichier contient deux fois le même abonnement.' }
  }
  return { ok: true, donnees: { version: 1, abonnements: d.abonnements as Abonnement[] } }
}

export function versJson(donnees: DonneesAboClair, maintenant = new Date()): string {
  return JSON.stringify({ ...donnees, exporteLe: maintenant.toISOString() }, null, 2)
}

/**
 * La première version du catalogue comptait Basic-Fit « par mois » alors qu'il prélève toutes les
 * 4 semaines. Si le prix enregistré est resté celui du catalogue, on corrige la fréquence ;
 * un prix modifié par l'utilisateur n'est pas touché.
 */
export function migrer(donnees: DonneesAboClair): DonneesAboClair {
  return {
    ...donnees,
    abonnements: donnees.abonnements.map((a) => {
      const s = trouverService(a.serviceId)
      const prixCatalogue = s && Math.round(s.prixIndicatif * 100)
      return s && s.frequence === '4-semaines' && a.frequence === 'mensuel' && a.prixCentimes === prixCatalogue
        ? { ...a, frequence: '4-semaines' }
        : a
    }),
  }
}

/** Le stockage peut être indisponible (navigation privée, données bloquées) : on ne plante jamais. */
export function charger(): DonneesAboClair {
  try {
    const texte = localStorage.getItem(CLE_STOCKAGE)
    if (!texte) return donneesVides()
    const resultat = lireJson(texte)
    return resultat.ok ? migrer(resultat.donnees) : donneesVides()
  } catch {
    return donneesVides()
  }
}

export function sauvegarder(donnees: DonneesAboClair): boolean {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(donnees))
    return true
  } catch {
    return false
  }
}
