import { suivre } from '../lib/audience'
import { CONSEIL_PREUVE, DROITS } from '../lib/droits'
import { trouverMarque, trouverService } from '../lib/catalogue'
import { formaterDate } from '../lib/format'
import { guideResiliation, URL_SIGNALCONSO } from '../lib/resiliation'
import type { ReactNode } from 'react'
import type { Abonnement } from '../types'
import { IconeLien } from './ui/Icones'

export function FicheResiliation({
  abonnement: a,
  aujourdhui,
  rappel,
}: {
  abonnement: Abonnement
  aujourdhui: string
  /** Bouton de rappel affiché sous l'alerte de fin d'essai. */
  rappel?: ReactNode
}) {
  const guide = guideResiliation(a)
  const service = trouverService(a.serviceId)
  const marque = service && trouverMarque(service.marque)
  const essaiEnCours = a.finEssai && a.finEssai >= aujourdhui

  return (
    <div className="flex flex-col gap-5 pb-2 pt-2">
      {essaiEnCours && (
        <p className="rounded-2xl bg-pause/12 p-4 text-[0.9375rem] font-medium text-pause">
          Ton essai gratuit se termine le {formaterDate(a.finEssai!)}. Résilie avant pour ne rien payer.
        </p>
      )}
      {essaiEnCours && rappel}
      {guide.alerte && (
        <p className="rounded-2xl bg-accent/10 p-4 text-[0.9375rem] text-texte">{guide.alerte}</p>
      )}

      <ol className="flex flex-col gap-4">
        <Etape numero={1} titre="Va sur la bonne page">
          <a
            href={guide.lien.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => suivre('lien-resiliation')}
            className="appui mt-2 flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-[0.9375rem] font-semibold text-accent-texte"
          >
            {guide.lien.libelle}
            <IconeLien className="text-base" />
            <span className="sr-only">(nouvel onglet)</span>
          </a>
        </Etape>
        <Etape numero={2} titre="Suis le chemin">
          <p className="mt-0.5 text-[0.9375rem] text-texte-2">{guide.etape}</p>
        </Etape>
        <Etape numero={3} titre="Garde une preuve">
          <p className="mt-0.5 text-[0.9375rem] text-texte-2">{CONSEIL_PREUVE}</p>
        </Etape>
      </ol>

      <div className="rounded-2xl bg-fond p-4">
        <h3 className="font-semibold">Tes droits</h3>
        <ul className="mt-2 flex flex-col gap-3 text-[0.9375rem] text-texte-2">
          {DROITS.map((d) => (
            <li key={d.titre}>
              <strong className="font-semibold text-texte">{d.titre}</strong> {d.texte}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[0.9375rem] text-texte-2">
          Un service bloque ta résiliation ?{' '}
          <a
            href={URL_SIGNALCONSO}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline underline-offset-2"
          >
            Signale-le sur SignalConso
          </a>
          , le site officiel de la DGCCRF.
        </p>
      </div>

      <p className="text-[0.8125rem] text-texte-2">
        Information, pas conseil juridique.
        {marque && (
          <>
            {' '}
            <a
              href={`${import.meta.env.BASE_URL}resilier/${marque.slug}/`}
              className="font-medium text-accent underline underline-offset-2"
            >
              Guide complet pour {marque.nom}
            </a>
          </>
        )}
      </p>
    </div>
  )
}

function Etape({ numero, titre, children }: { numero: number; titre: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-semibold tabular-nums"
        aria-hidden="true"
      >
        {numero}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="font-semibold">{titre}</p>
        {children}
      </div>
    </li>
  )
}
