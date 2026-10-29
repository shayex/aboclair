import { formaterEuros } from '../lib/format'
import { VERDICTS } from '../lib/libelles'
import type { Plan as DonneesPlan } from '../lib/verdict'
import type { ReactNode } from 'react'
import type { Verdict } from '../types'
import { motion } from 'motion/react'
import { IconeCoche } from './ui/Icones'
import { Montant } from './ui/Montant'
import { PastilleVerdict, Section } from './ui/Section'

export function Plan({
  plan,
  nombre,
  actionPour,
  onFait,
}: {
  plan: DonneesPlan
  nombre: number
  /** Bouton d'action pour une ligne (résilier…), fourni par la page. */
  actionPour?: (id: string, verdict: Verdict) => ReactNode
  onFait: (id: string, fait: boolean) => void
}) {
  if (nombre === 0) return null
  const rienRepondu = plan.restants === nombre

  return (
    <Section titre="Ton plan">
      {rienRepondu ? (
        <p className="mt-3 rounded-2xl border border-bord bg-surface p-5 text-[0.9375rem] text-texte-2">
          Réponds à « souvent, parfois ou jamais » ci-dessus pour voir ce que tu peux économiser.
        </p>
      ) : (
        <>
          <div className="mt-4 rounded-[1.75rem] bg-garder/10 p-6">
            <p className="text-[0.9375rem] font-medium text-garder">Tu peux économiser jusqu’à</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
              <Montant
                centimes={plan.economieTotale}
                arrondi
                className="text-[3rem] font-bold leading-none tracking-[-0.04em] tabular-nums"
              />
              <span className="text-xl font-semibold text-texte-2">par an</span>
            </p>
            <p className="mt-2 text-[0.9375rem] text-texte-2 tabular-nums">
              soit {formaterEuros(plan.economieTotale * 10, true)} sur 10 ans
            </p>
            {plan.economieFaite > 0 && <Progression faite={plan.economieFaite} totale={plan.economieTotale} />}
            {plan.restants > 0 && (
              <p className="mt-3 text-[0.8125rem] text-texte-2">
                Encore {plan.restants} abonnement{plan.restants > 1 ? 's' : ''} à trier.
              </p>
            )}
          </div>

          {plan.actions.length > 0 && (
            <>
              <p className="mt-5 text-[0.875rem] text-texte-2">Coche chaque action une fois faite.</p>
              <ol className="mt-2 overflow-hidden rounded-2xl border border-bord bg-surface">
                {plan.actions.map(({ abonnement: a, verdict, economie, fait }) => (
                  <li key={a.id} className="flex items-center gap-3 border-b border-bord px-4 py-3 last:border-b-0">
                    <CaseFait nom={a.nom} fait={fait} onChanger={(v) => onFait(a.id, v)} />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate font-medium transition-colors duration-200 ${
                          fait ? 'text-texte-2 line-through decoration-texte-2/60' : ''
                        }`}
                      >
                        {a.nom}
                      </p>
                      <p className="mt-1 flex items-center gap-2">
                        <PastilleVerdict {...VERDICTS[verdict]} />
                        <span className="text-[0.8125rem] font-semibold text-garder tabular-nums">
                          {fait ? `${formaterEuros(economie, true)}/an économisés` : `−${formaterEuros(economie, true)}/an`}
                        </span>
                      </p>
                    </div>
                    {!fait && actionPour?.(a.id, verdict)}
                  </li>
                ))}
              </ol>
            </>
          )}

          {plan.gardes.length > 0 && (
            <p className="mt-3 text-[0.8125rem] text-texte-2">
              Tu gardes {plan.gardes.map((l) => l.abonnement.nom).join(', ')}.
            </p>
          )}
        </>
      )}
    </Section>
  )
}

function CaseFait({ nom, fait, onChanger }: { nom: string; fait: boolean; onChanger: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={fait}
      aria-label={`${nom} : c’est fait`}
      onClick={() => onChanger(!fait)}
      className={`appui grid size-7 shrink-0 place-items-center rounded-full border-2 ${
        fait ? 'border-garder bg-garder text-white' : 'border-texte-2/40'
      }`}
    >
      {fait && (
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0, visualDuration: 0.2 }}
          className="grid place-items-center"
        >
          <IconeCoche className="text-[0.875rem]" />
        </motion.span>
      )}
    </button>
  )
}

function Progression({ faite, totale }: { faite: number; totale: number }) {
  return (
    <div className="mt-5 rounded-2xl bg-surface/70 p-4">
      <p className="text-[0.9375rem]">
        Déjà économisé pour de vrai :{' '}
        <strong className="whitespace-nowrap font-semibold tabular-nums">
          <Montant centimes={faite} arrondi /> par an
        </strong>
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-garder/15" aria-hidden="true">
        <motion.div
          className="h-full w-full rounded-full bg-garder"
          style={{ originX: 0 }}
          initial={false}
          animate={{ scaleX: totale > 0 ? faite / totale : 0 }}
          transition={{ type: 'spring', bounce: 0, visualDuration: 0.45 }}
        />
      </div>
      <p className="mt-1.5 text-[0.8125rem] text-texte-2 tabular-nums">
        {Math.round((faite / totale) * 100)} % de ce que tu peux économiser
      </p>
    </div>
  )
}
