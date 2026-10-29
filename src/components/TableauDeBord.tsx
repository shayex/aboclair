import { motion } from 'motion/react'
import { useEffect, useId, useRef } from 'react'
import { suivre } from '../lib/audience'
import type { Totaux } from '../lib/calculs'
import { formaterEuros } from '../lib/format'
import { MOYENNE_FRANCAISE, type Comparaison } from '../lib/moyenne'
import { Montant } from './ui/Montant'

export const ID_BILAN = 'bilan'

export function TableauDeBord({
  totaux,
  nombre,
  comparaison,
  economieFaite,
}: {
  totaux: Totaux
  nombre: number
  comparaison: Comparaison | null
  /** Économies annuelles déjà réalisées (actions cochées dans le plan). */
  economieFaite: number
}) {
  const idTitre = useId()
  const ref = useRef<HTMLElement>(null)

  // Indicateur clé : la part des visiteurs qui voient leur total.
  useEffect(() => {
    const el = ref.current
    if (!el || nombre === 0) return
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && suivre('bilan-vu', true), { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [nombre > 0])
  return (
    <section ref={ref} id={ID_BILAN} aria-labelledby={idTitre} className="mt-12 scroll-mt-6">
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
          {economieFaite > 0 && (
            <p className="mt-2 text-[0.9375rem] font-medium text-garder tabular-nums">
              Après tes changements : {formaterEuros(totaux.annuel - economieFaite, true)} par an
            </p>
          )}
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
          {comparaison && <ComparaisonMoyenne comparaison={comparaison} />}
          <p className="mt-4 text-[0.8125rem] text-texte-2">
            Calcul à prix constants. Avec les hausses de prix habituelles, la facture réelle sur 10 ans sera plus
            élevée.
          </p>
        </div>
      )}
    </section>
  )
}

function ComparaisonMoyenne({ comparaison: c }: { comparaison: Comparaison }) {
  const moyenne = MOYENNE_FRANCAISE.centimesParMois
  const max = Math.max(c.mensuel, moyenne)
  const couleur = c.ratio > 1.05 ? 'bg-couper' : c.ratio < 0.95 ? 'bg-garder' : 'bg-accent'
  const barres = [
    { libelle: 'Toi', valeur: c.mensuel, classe: couleur },
    { libelle: 'Moyenne', valeur: moyenne, classe: 'bg-texte-2/35' },
  ]
  return (
    <div className="mt-5 border-t border-bord pt-5">
      <p className="text-[0.9375rem] leading-snug">
        En vidéo, musique, jeux et presse, tu paies{' '}
        <strong className="font-semibold tabular-nums">{formaterEuros(c.mensuel)} par mois</strong>, soit {c.phrase}.
      </p>
      <dl className="mt-3 flex flex-col gap-2" aria-hidden="true">
        {barres.map((b) => (
          <div key={b.libelle} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-2 text-[0.8125rem]">
            <dt className="text-texte-2">{b.libelle}</dt>
            <dd className="h-2.5 overflow-hidden rounded-full bg-fond">
              <motion.div
                className={`h-full w-full rounded-full ${b.classe}`}
                style={{ originX: 0 }}
                initial={false}
                animate={{ scaleX: b.valeur / max }}
                transition={{ type: 'spring', bounce: 0, visualDuration: 0.45 }}
              />
            </dd>
            <dd className="text-right font-medium tabular-nums">{formaterEuros(b.valeur, true)}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-[0.75rem] text-texte-2">
        Moyenne des abonnements culturels en ligne :{' '}
        <a href={MOYENNE_FRANCAISE.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          {MOYENNE_FRANCAISE.source}
        </a>
        .
      </p>
    </div>
  )
}
