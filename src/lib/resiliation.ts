import type { Abonnement } from '../types'
import { trouverService } from './catalogue'

export const URL_ABONNEMENTS_APPLE = 'https://apps.apple.com/account/subscriptions'
export const URL_ABONNEMENTS_GOOGLE_PLAY = 'https://play.google.com/store/account/subscriptions'
export const URL_SIGNALCONSO = 'https://signal.conso.gouv.fr'

export interface GuideResiliation {
  /** Où cliquer pour résilier. */
  lien: { url: string; libelle: string }
  /** Le chemin à suivre une fois sur place. */
  etape: string
  /** Mise en garde liée au moyen de paiement, s'il y en a une. */
  alerte?: string
}

/** Le bon endroit pour résilier dépend d'abord de qui encaisse le paiement. */
export function guideResiliation(a: Pick<Abonnement, 'serviceId' | 'nom' | 'payeVia'>): GuideResiliation {
  const service = trouverService(a.serviceId)

  if (a.payeVia === 'app-store') {
    return {
      lien: { url: URL_ABONNEMENTS_APPLE, libelle: 'Ouvrir mes abonnements Apple' },
      etape: 'Sur iPhone : Réglages → ton nom → Abonnements → choisis le service → Annuler.',
      alerte:
        'Tu paies via l’App Store : la résiliation se fait chez Apple. Résilier sur le site du service ne suffit pas.',
    }
  }
  if (a.payeVia === 'google-play') {
    return {
      lien: { url: URL_ABONNEMENTS_GOOGLE_PLAY, libelle: 'Ouvrir mes abonnements Google Play' },
      etape: 'Dans le Play Store : ton profil → Paiements et abonnements → Abonnements → Résilier.',
      alerte:
        'Tu paies via Google Play : la résiliation se fait chez Google. Désinstaller l’appli n’arrête pas l’abonnement.',
    }
  }

  const lien = service
    ? { url: service.urlResiliation, libelle: 'Ouvrir la page de résiliation' }
    : {
        url: `https://duckduckgo.com/?q=${encodeURIComponent(`résilier ${a.nom}`)}`,
        libelle: `Chercher « résilier ${a.nom} »`,
      }
  const etape = service
    ? service.noteResiliation
    : 'Connecte-toi à ton espace client sur le site du service et cherche la rubrique « Mon abonnement » ou « Résilier ».'

  if (a.payeVia === 'paypal') {
    return {
      lien,
      etape,
      alerte:
        'Tu paies via PayPal : résilie d’abord chez le service. Couper le paiement automatique dans PayPal (Paramètres → Paiements) arrête les prélèvements, mais ne met pas fin au contrat.',
    }
  }
  if (a.payeVia === 'facture-operateur') {
    return {
      lien,
      etape,
      alerte:
        'Tu paies via ta facture opérateur : si l’option n’apparaît pas chez le service, passe par ton espace client opérateur, rubrique options ou services.',
    }
  }
  return { lien, etape }
}
