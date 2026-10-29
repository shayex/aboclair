/**
 * Mesure d'audience Umami : sans cookie, sans donnée personnelle, désactivée tant que
 * VITE_UMAMI_WEBSITE_ID n'est pas défini. Les événements ne contiennent jamais de montant
 * ni de nom d'abonnement : seulement « quelqu'un est arrivé jusqu'ici ».
 */
export const URL_SCRIPT_UMAMI = 'https://cloud.umami.is/script.js'

export function baliseAudience(idSite: string | undefined, site?: string): string {
  if (!idSite || !/^[0-9a-f-]{36}$/i.test(idSite)) return ''
  const domaine = site ? ` data-domains="${new URL(site).hostname}"` : ''
  return `<script defer src="${URL_SCRIPT_UMAMI}" data-website-id="${idSite}" data-do-not-track="true"${domaine}></script>`
}

export type Evenement =
  | 'abonnement-ajoute'
  | 'bilan-vu'
  | 'tri-commence'
  | 'resiliation-ouverte'
  | 'lien-resiliation'
  | 'rappel-ajoute'
  | 'action-faite'
  | 'carte-partagee'
  | 'sauvegarde-exportee'

declare global {
  interface Window {
    umami?: { track: (evenement: string) => void }
  }
}

const dejaEnvoyes = new Set<Evenement>()

/** Envoie un événement anonyme. `unique` : une seule fois par visite. */
export function suivre(evenement: Evenement, unique = false): void {
  if (unique) {
    if (dejaEnvoyes.has(evenement)) return
    dejaEnvoyes.add(evenement)
  }
  try {
    window.umami?.track(evenement)
  } catch {
    // La mesure d'audience ne doit jamais casser le site.
  }
}
