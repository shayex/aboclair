import { describe, expect, it } from 'vitest'
import { guideResiliation, URL_ABONNEMENTS_APPLE, URL_ABONNEMENTS_GOOGLE_PLAY } from './resiliation'

describe('guideResiliation', () => {
  it('renvoie vers la page du service du catalogue', () => {
    const g = guideResiliation({ serviceId: 'netflix-standard', nom: 'Netflix', payeVia: 'cb' })
    expect(g.lien.url).toBe('https://www.netflix.com/cancelplan')
    expect(g.alerte).toBeUndefined()
  })
  it('renvoie vers Apple quand le paiement passe par l’App Store', () => {
    const g = guideResiliation({ serviceId: 'netflix-standard', nom: 'Netflix', payeVia: 'app-store' })
    expect(g.lien.url).toBe(URL_ABONNEMENTS_APPLE)
    expect(g.alerte).toMatch(/Apple/)
  })
  it('renvoie vers Google Play quand le paiement passe par Google Play', () => {
    const g = guideResiliation({ serviceId: null, nom: 'Appli', payeVia: 'google-play' })
    expect(g.lien.url).toBe(URL_ABONNEMENTS_GOOGLE_PLAY)
  })
  it('prévient que couper PayPal ne résilie pas le contrat', () => {
    const g = guideResiliation({ serviceId: 'spotify', nom: 'Spotify', payeVia: 'paypal' })
    expect(g.lien.url).toContain('spotify.com')
    expect(g.alerte).toMatch(/ne met pas fin au contrat/)
  })
  it('propose une recherche pour un abonnement personnalisé', () => {
    const g = guideResiliation({ serviceId: null, nom: 'Salle d’escalade', payeVia: undefined })
    expect(g.lien.url).toBe('https://duckduckgo.com/?q=r%C3%A9silier%20Salle%20d%E2%80%99escalade')
  })
})
