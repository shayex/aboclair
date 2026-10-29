import type { Abonnement } from '../types'
import { ajouterJours, ajouterMois } from './dates'
import { formaterDate, formaterEuros, normaliser } from './format'
import { guideResiliation } from './resiliation'

export const JOURS_AVANT_FIN_ESSAI = 2
export const JOURS_AVANT_RENOUVELLEMENT = 7

export interface Rappel {
  uid: string
  type: 'essai' | 'renouvellement'
  /** Jour du rappel, AAAA-MM-JJ. */
  date: string
  /** Date de l'événement rappelé (fin d'essai ou prélèvement). */
  echeance: string
  titre: string
  description: string
  url?: string
  /** Répété chaque année (abonnement annuel). */
  annuel: boolean
}

/** Première échéance à partir d'aujourd'hui, en avançant d'un mois ou d'un an depuis la date saisie. */
export function prochaineEcheance(date: string, frequence: Abonnement['frequence'], aujourdhui: string): string {
  const pas = frequence === 'mensuel' ? 1 : 12
  let n = 0
  let echeance = date
  while (echeance < aujourdhui) {
    n += 1
    echeance = ajouterMois(date, n * pas) // depuis la date d'origine : le 31 reste le 31 quand le mois le permet
  }
  return echeance
}

function auPlusTot(date: string, aujourdhui: string): string {
  return date < aujourdhui ? aujourdhui : date
}

export function rappelsPour(a: Abonnement, aujourdhui: string): Rappel[] {
  const rappels: Rappel[] = []
  const { lien } = guideResiliation(a)

  if (a.finEssai && a.finEssai >= aujourdhui) {
    const fin = formaterDate(a.finEssai)
    rappels.push({
      uid: `${a.id}-essai@aboclair`,
      type: 'essai',
      date: auPlusTot(ajouterJours(a.finEssai, -JOURS_AVANT_FIN_ESSAI), aujourdhui),
      echeance: a.finEssai,
      titre: `Fin de l’essai ${a.nom} le ${fin}`,
      description: `Ton essai gratuit ${a.nom} se termine le ${fin}. Si tu ne veux pas le garder, résilie avant pour ne rien payer.\n${lien.libelle} : ${lien.url}`,
      url: lien.url,
      annuel: false,
    })
  }

  if (a.dateRenouvellement) {
    const echeance = prochaineEcheance(a.dateRenouvellement, a.frequence, aujourdhui)
    const ideal = ajouterJours(echeance, -JOURS_AVANT_RENOUVELLEMENT)
    const date = auPlusTot(ideal, aujourdhui)
    // Un rappel annuel ne se répète que s'il tombe bien 7 jours avant l'échéance,
    // et son texte ne cite pas d'année puisqu'il revient chaque année.
    const annuel = a.frequence === 'annuel' && date === ideal
    const quand = annuel ? `dans ${JOURS_AVANT_RENOUVELLEMENT} jours` : `le ${formaterDate(echeance)}`
    rappels.push({
      uid: `${a.id}-renouvellement@aboclair`,
      type: 'renouvellement',
      date,
      echeance,
      titre: `${a.nom} se renouvelle ${quand}`,
      description: `Prélèvement prévu ${quand} : ${formaterEuros(a.prixCentimes)}. Tu t’en sers encore ? Sinon, résilie avant.\n${lien.libelle} : ${lien.url}`,
      url: lien.url,
      annuel,
    })
  }

  return rappels
}

/** Échappe un texte selon la norme iCalendar (RFC 5545). */
export function echapper(texte: string): string {
  return texte.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Coupe les lignes à 75 octets, sans couper un caractère accentué en deux. */
export function plier(ligne: string): string {
  const encodeur = new TextEncoder()
  const morceaux: string[] = []
  let courant = ''
  let octets = 0
  for (const car of ligne) {
    const taille = encodeur.encode(car).length
    const limite = morceaux.length === 0 ? 75 : 74 // la suite commence par une espace
    if (octets + taille > limite) {
      morceaux.push(courant)
      courant = ''
      octets = 0
    }
    courant += car
    octets += taille
  }
  morceaux.push(courant)
  return morceaux.join('\r\n ')
}

function dateIcs(iso: string): string {
  return iso.replace(/-/g, '')
}

function horodatage(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

export function genererIcs(rappels: Rappel[], maintenant = new Date()): string {
  const lignes = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AboClair//Rappels//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]
  for (const r of rappels) {
    lignes.push(
      'BEGIN:VEVENT',
      `UID:${r.uid}`,
      `DTSTAMP:${horodatage(maintenant)}`,
      `DTSTART;VALUE=DATE:${dateIcs(r.date)}`,
      `DTEND;VALUE=DATE:${dateIcs(ajouterJours(r.date, 1))}`,
      `SUMMARY:${echapper(r.titre)}`,
      `DESCRIPTION:${echapper(r.description)}`,
      ...(r.url ? [`URL:${r.url}`] : []),
      ...(r.annuel ? ['RRULE:FREQ=YEARLY'] : []),
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${echapper(r.titre)}`,
      'TRIGGER:PT9H', // à 9 h le jour du rappel
      'END:VALARM',
      'END:VEVENT',
    )
  }
  lignes.push('END:VCALENDAR')
  return lignes.map(plier).join('\r\n') + '\r\n'
}

export function nomFichierIcs(nom: string): string {
  const slug = normaliser(nom).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `rappel-${slug || 'abonnement'}.ics`
}
