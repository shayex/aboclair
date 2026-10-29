import { useState } from 'react'
import { genererCarte, texteCarte } from '../lib/carte'
import { telecharger } from '../lib/telechargement'
import { IconePartage } from './ui/Icones'

export const ADRESSE_SITE = `${window.location.origin}${import.meta.env.BASE_URL}`

/** Génère la carte « J'ai trouvé X € d'économies » et la partage (téléphone) ou la télécharge. */
export function BoutonPartage({
  economieTotale,
  economieFaite,
  onPartage,
}: {
  economieTotale: number
  economieFaite: number
  onPartage?: () => void
}) {
  const [etat, setEtat] = useState<'repos' | 'en-cours' | 'telechargee' | 'erreur'>('repos')

  async function partager() {
    setEtat('en-cours')
    try {
      const texte = texteCarte(economieTotale, economieFaite, ADRESSE_SITE)
      const blob = await genererCarte(texte, ADRESSE_SITE.replace(/^https?:\/\//, '').replace(/\/$/, ''))
      const fichier = new File([blob], 'aboclair-economies.png', { type: 'image/png' })
      onPartage?.()
      if (navigator.canShare?.({ files: [fichier] })) {
        try {
          await navigator.share({ files: [fichier], text: texte.partage })
        } catch (e) {
          // L'utilisateur a fermé la feuille de partage : ce n'est pas une erreur.
          if ((e as DOMException).name !== 'AbortError') throw e
        }
        setEtat('repos')
      } else {
        telecharger(fichier.name, blob)
        setEtat('telechargee')
      }
    } catch {
      setEtat('erreur')
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={partager}
        disabled={etat === 'en-cours'}
        className="appui flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-garder text-[0.9375rem] font-semibold text-accent-texte disabled:opacity-60"
      >
        <IconePartage className="text-lg" />
        Partager mes économies
      </button>
      <p className="mt-1.5 min-h-5 text-center text-[0.8125rem] text-texte-2" aria-live="polite">
        {etat === 'telechargee' && 'Image téléchargée : publie-la où tu veux.'}
        {etat === 'erreur' && 'L’image n’a pas pu être créée sur ce navigateur.'}
        {(etat === 'repos' || etat === 'en-cours') && 'Une image avec ton montant, sans le détail de tes abonnements.'}
      </p>
    </div>
  )
}
