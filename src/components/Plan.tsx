import { formaterEuros } from '../lib/format'
import { VERDICTS } from '../lib/libelles'
import type { Plan as DonneesPlan } from '../lib/verdict'
import type { ReactNode } from 'react'
import { Montant } from './ui/Montant'
import { PastilleVerdict, Section } from './ui/Section'

export function Plan({
  plan,
  nombre,
  actionPour,
}: {
  plan: DonneesPlan
  nombre: number
  /** Bouton d'action pour une ligne (résilier…), fourni par la page. */
  actionPour?: (id: string) => ReactNode
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
            {plan.restants > 0 && (
              <p className="mt-3 text-[0.8125rem] text-texte-2">
                Encore {plan.restants} abonnement{plan.restants > 1 ? 's' : ''} à trier.
              </p>
            )}
          </div>

          {plan.actions.length > 0 && (
            <ol className="mt-4 overflow-hidden rounded-2xl border border-bord bg-surface">
              {plan.actions.map(({ abonnement: a, verdict, economie }) => (
                <li key={a.id} className="flex items-center gap-3 border-b border-bord px-4 py-3 last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{a.nom}</p>
                    <p className="mt-1 flex items-center gap-2">
                      <PastilleVerdict {...VERDICTS[verdict]} />
                      <span className="text-[0.8125rem] font-semibold text-garder tabular-nums">
                        −{formaterEuros(economie, true)}/an
                      </span>
                    </p>
                  </div>
                  {actionPour?.(a.id)}
                </li>
              ))}
            </ol>
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
