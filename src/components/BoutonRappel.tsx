import { useState } from 'react'
import { suivre } from '../lib/audience'
import { formaterDate } from '../lib/format'
import { genererIcs, nomFichierIcs, rappelsPour } from '../lib/ics'
import { telecharger } from '../lib/telechargement'
import type { Abonnement } from '../types'
import { IconeCalendrier } from './ui/Icones'

export function BoutonRappel({ abonnement, aujourdhui }: { abonnement: Abonnement; aujourdhui: string }) {
  const [fait, setFait] = useState(false)
  const rappels = rappelsPour(abonnement, aujourdhui)

  if (rappels.length === 0) {
    return (
      <p className="flex gap-2.5 rounded-2xl bg-fond p-4 text-[0.875rem] text-texte-2">
        <IconeCalendrier className="mt-0.5 shrink-0 text-base" />
        Ajoute une date de renouvellement ou de fin d’essai pour recevoir un rappel dans ton calendrier.
      </p>
    )
  }

  function ajouter() {
    telecharger(nomFichierIcs(abonnement.nom), genererIcs(rappels), 'text/calendar;charset=utf-8')
    setFait(true)
    suivre('rappel-ajoute')
  }

  return (
    <div className="rounded-2xl bg-fond p-4">
      <button
        type="button"
        onClick={ajouter}
        className="appui flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface text-[0.9375rem] font-semibold shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
      >
        <IconeCalendrier className="text-lg text-accent" />
        Ajouter un rappel au calendrier
      </button>
      <ul className="mt-3 flex flex-col gap-1 text-[0.8125rem] text-texte-2">
        {rappels.map((r) => (
          <li key={r.uid}>
            {r.type === 'essai' ? 'Fin d’essai' : 'Renouvellement'} : rappel le {formaterDate(r.date)}
            {r.annuel && ', puis chaque année'}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[0.8125rem] text-texte-2" aria-live="polite">
        {fait
          ? 'Fichier téléchargé : ouvre-le pour l’ajouter à ton calendrier.'
          : 'Un fichier .ics s’ouvre dans ton agenda. Rien n’est envoyé sur Internet.'}
      </p>
    </div>
  )
}
