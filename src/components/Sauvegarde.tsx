import { useRef, useState } from 'react'
import { suivre } from '../lib/audience'
import { lireJson, versJson } from '../lib/stockage'
import { aujourdhuiIso } from '../lib/dates'
import { telecharger } from '../lib/telechargement'
import type { DonneesAboClair } from '../types'
import { Section } from './ui/Section'

type Message = { type: 'ok' | 'erreur'; texte: string } | null

export function Sauvegarde({
  donnees,
  stockageOk,
  onRemplacer,
}: {
  donnees: DonneesAboClair
  stockageOk: boolean
  onRemplacer: (d: DonneesAboClair) => void
}) {
  const [message, setMessage] = useState<Message>(null)
  const refFichier = useRef<HTMLInputElement>(null)
  const nombre = donnees.abonnements.length

  function exporter() {
    telecharger(`aboclair-${aujourdhuiIso()}.json`, versJson(donnees), 'application/json')
    setMessage({ type: 'ok', texte: 'Sauvegarde téléchargée. Garde-la dans tes fichiers ou ton cloud.' })
    suivre('sauvegarde-exportee')
  }

  async function importer(fichier: File | undefined) {
    if (!fichier) return
    const resultat = lireJson(await fichier.text())
    if (refFichier.current) refFichier.current.value = ''
    if (!resultat.ok) {
      setMessage({ type: 'erreur', texte: resultat.erreur })
      return
    }
    const n = resultat.donnees.abonnements.length
    if (nombre > 0 && !window.confirm(`Remplacer tes ${nombre} abonnements actuels par les ${n} du fichier ?`)) return
    onRemplacer(resultat.donnees)
    setMessage({ type: 'ok', texte: `${n} abonnement${n > 1 ? 's' : ''} restauré${n > 1 ? 's' : ''}.` })
  }

  function effacer() {
    if (!window.confirm('Effacer tous tes abonnements de ce navigateur ?')) return
    onRemplacer({ version: 1, abonnements: [] })
    setMessage({ type: 'ok', texte: 'Tout est effacé.' })
  }

  return (
    <Section
      titre="Tes données"
      intro="Tes abonnements restent dans ce navigateur, rien n’est envoyé. Si tu le vides ou changes de téléphone, tes abonnements disparaissent : garde une copie."
    >
      {!stockageOk && (
        <p className="mt-3 rounded-2xl bg-pause/12 p-4 text-[0.9375rem] font-medium text-pause">
          Ton navigateur bloque l’enregistrement (navigation privée ?). Télécharge une sauvegarde avant de fermer la
          page.
        </p>
      )}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={exporter}
          disabled={nombre === 0}
          className="appui h-12 rounded-2xl bg-surface-2 text-[0.9375rem] font-semibold disabled:opacity-40"
        >
          Télécharger une sauvegarde
        </button>
        <label className="appui flex h-12 cursor-pointer items-center justify-center rounded-2xl bg-surface-2 text-[0.9375rem] font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent">
          Restaurer une sauvegarde
          <input
            ref={refFichier}
            type="file"
            accept="application/json,.json"
            onChange={(e) => importer(e.target.files?.[0])}
            className="sr-only"
          />
        </label>
      </div>
      <p
        role="status"
        className={`mt-3 min-h-5 text-[0.875rem] ${message?.type === 'erreur' ? 'font-medium text-couper' : 'text-texte-2'}`}
      >
        {message?.texte}
      </p>
      {nombre > 0 && (
        <button type="button" onClick={effacer} className="mt-4 text-[0.875rem] font-medium text-couper">
          Tout effacer
        </button>
      )}
    </Section>
  )
}
