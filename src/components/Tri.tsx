import { AnimatePresence, motion } from 'motion/react'
import { coutAnnuelCentimes } from '../lib/calculs'
import { formaterEuros } from '../lib/format'
import { USAGES, VERDICTS } from '../lib/libelles'
import { economieAnnuelleCentimes, estPartageable, verdictPour } from '../lib/verdict'
import type { Abonnement, Usage, Verdict } from '../types'
import { ChoixSegmente } from './ui/Choix'
import { LogoMarque, nomDeMarque } from './ui/LogoMarque'
import { PastilleVerdict, Section } from './ui/Section'

const CONSEILS: Record<Verdict, string> = {
  garder: 'Tu t’en sers : il mérite sa place.',
  partager: 'Passe à l’offre famille ou partage-la avec un proche : tu divises la facture.',
  pause: 'Résilie maintenant et reprends un mois quand tu en as vraiment besoin.',
  couper: 'Tu ne t’en sers pas : résilie-le.',
}

export function Tri({
  abonnements,
  onUsage,
}: {
  abonnements: Abonnement[]
  onUsage: (id: string, usage: Usage) => void
}) {
  if (abonnements.length === 0) return null
  return (
    <Section titre="Fais le tri" intro="Pour chaque abonnement : tu t’en sers souvent, parfois ou jamais ?">
      <ul className="mt-4 flex flex-col gap-2.5">
        {abonnements.map((a) => {
          const verdict = a.usage ? verdictPour(a.usage, estPartageable(a)) : undefined
          const economie = verdict ? economieAnnuelleCentimes(a, verdict) : 0
          return (
            <li key={a.id} className="rounded-2xl border border-bord bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2.5">
                  <LogoMarque nom={nomDeMarque(a)} taille={28} />
                  <span className="min-w-0 truncate font-medium">{a.nom}</span>
                </span>
                <span className="shrink-0 text-[0.8125rem] text-texte-2 tabular-nums">
                  {formaterEuros(coutAnnuelCentimes(a))} par an
                </span>
              </div>
              <div className="mt-3">
                <ChoixSegmente
                  legende={`À quelle fréquence utilises-tu ${a.nom} ?`}
                  masquerLegende
                  options={USAGES}
                  valeur={a.usage}
                  onChanger={(u) => onUsage(a.id, u)}
                />
              </div>
              <div aria-live="polite">
                <AnimatePresence mode="popLayout" initial={false}>
                  {verdict && (
                    <motion.div
                      key={verdict}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      transition={{ type: 'spring', bounce: 0, visualDuration: 0.25 }}
                      className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1"
                    >
                      <PastilleVerdict {...VERDICTS[verdict]} />
                      {economie > 0 && (
                        <span className="text-[0.8125rem] font-semibold text-garder tabular-nums">
                          −{formaterEuros(economie)} par an
                        </span>
                      )}
                      <p className="basis-full text-[0.8125rem] text-texte-2">{CONSEILS[verdict]}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
