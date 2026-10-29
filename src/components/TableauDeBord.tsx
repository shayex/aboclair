import { useId } from 'react'
import type { Totaux } from '../lib/calculs'
import { Montant } from './ui/Montant'

export const ID_BILAN = 'bilan'

export function TableauDeBord({ totaux, nombre }: { totaux: Totaux; nombre: number }) {
  const idTitre = useId()
  return (
    <section id={ID_BILAN} aria-labelledby={idTitre} className="mt-12 scroll-mt-6">
      <h2 id={idTitre} tabIndex={-1} className="text-[1.375rem] outline-none font-semibold leading-tight tracking-[-0.015em]">
        Ton bilan
      </h2>
      {nombre === 0 ? (
        <p className="mt-3 rounded-2xl border border-bord bg-surface p-5 text-[0.9375rem] text-texte-2">
          Coche au moins un abonnement pour voir ce qu’il te coûte vraiment.
        </p>
      ) : (
        <div className="mt-4 rounded-[1.75rem] bg-surface p-6 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_rgb(0_0_0/0.05)]">
          <p className="text-[0.9375rem] font-medium text-texte-2">
            Tes {nombre} abonnement{nombre > 1 ? 's' : ''} te coûte{nombre > 1 ? 'nt' : ''}
          </p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <Montant
              centimes={totaux.annuel}
              arrondi
              className="text-[3.5rem] font-bold leading-none tracking-[-0.04em] tabular-nums sm:text-[4.25rem]"
            />
            <span className="text-xl font-semibold text-texte-2">par an</span>
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-fond p-4">
              <dt className="text-[0.8125rem] font-medium text-texte-2">Par mois</dt>
              <dd className="mt-0.5 text-[1.5rem] font-semibold leading-tight tracking-[-0.02em] tabular-nums">
                <Montant centimes={totaux.mensuel} />
              </dd>
            </div>
            <div className="rounded-2xl bg-couper/10 p-4">
              <dt className="text-[0.8125rem] font-medium text-couper">Sur 10 ans</dt>
              <dd className="mt-0.5 text-[1.5rem] font-semibold leading-tight tracking-[-0.02em] tabular-nums">
                <Montant centimes={totaux.dixAns} arrondi />
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-[0.8125rem] text-texte-2">
            Calcul à prix constants. Avec les hausses de prix habituelles, la facture réelle sur 10 ans sera plus
            élevée.
          </p>
        </div>
      )}
    </section>
  )
}
