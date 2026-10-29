import { formaterDate } from '../lib/format'
import { guideResiliation, URL_SIGNALCONSO } from '../lib/resiliation'
import type { ReactNode } from 'react'
import type { Abonnement } from '../types'
import { IconeLien } from './ui/Icones'

export function FicheResiliation({ abonnement: a, aujourdhui }: { abonnement: Abonnement; aujourdhui: string }) {
  const guide = guideResiliation(a)
  const essaiEnCours = a.finEssai && a.finEssai >= aujourdhui

  return (
    <div className="flex flex-col gap-5 pb-2 pt-2">
      {essaiEnCours && (
        <p className="rounded-2xl bg-pause/12 p-4 text-[0.9375rem] font-medium text-pause">
          Ton essai gratuit se termine le {formaterDate(a.finEssai!)}. Résilie avant pour ne rien payer.
        </p>
      )}
      {guide.alerte && (
        <p className="rounded-2xl bg-accent/10 p-4 text-[0.9375rem] text-texte">{guide.alerte}</p>
      )}

      <ol className="flex flex-col gap-4">
        <Etape numero={1} titre="Va sur la bonne page">
          <a
            href={guide.lien.url}
            target="_blank"
            rel="noopener noreferrer"
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
          <p className="mt-0.5 text-[0.9375rem] text-texte-2">
            Fais une capture d’écran de la confirmation, et garde l’e-mail si tu en reçois un. Sans preuve, une
            résiliation est difficile à faire valoir.
          </p>
        </Etape>
      </ol>

      <div className="rounded-2xl bg-fond p-4">
        <h3 className="font-semibold">Tes droits</h3>
        <ul className="mt-2 flex flex-col gap-3 text-[0.9375rem] text-texte-2">
          <li>
            <strong className="font-semibold text-texte">Résiliation en 3 clics.</strong> Depuis le 1er juin 2023, un
            contrat souscrit en ligne doit pouvoir être résilié en ligne, simplement et gratuitement. Le professionnel
            doit confirmer ta demande.
          </li>
          <li>
            <strong className="font-semibold text-texte">Loi Chatel.</strong> Pour un abonnement reconduit
            automatiquement, le professionnel doit te prévenir par écrit 1 à 3 mois avant l’échéance. S’il ne l’a pas
            fait, tu peux résilier gratuitement à tout moment après la reconduction.
          </li>
          <li>
            <strong className="font-semibold text-texte">Engagement.</strong> Pour une box ou une salle de sport,
            résilier avant la fin de l’engagement peut coûter des frais.
          </li>
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

      <p className="text-[0.8125rem] text-texte-2">Information, pas conseil juridique.</p>
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
