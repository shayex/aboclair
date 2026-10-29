import { AnimatePresence, motion } from 'motion/react'
import { useId } from 'react'
import { libelleCategorie } from '../lib/catalogue'
import { formaterDate, formaterEuros } from '../lib/format'
import { infosFrequence, libellePayeVia } from '../lib/libelles'
import type { Abonnement } from '../types'
import { IconeChevron, IconePlus } from './ui/Icones'

interface Props {
  abonnements: Abonnement[]
  onOuvrir: (id: string) => void
  onNouveau: () => void
}

export function ListeAbonnements({ abonnements, onOuvrir, onNouveau }: Props) {
  const idTitre = useId()
  return (
    <section aria-labelledby={idTitre} className="mt-12">
      <h2 id={idTitre} className="text-[1.375rem] font-semibold leading-tight tracking-[-0.015em]">
        Tes abonnements
      </h2>
      <p className="mt-1 text-[0.9375rem] text-texte-2">
        {abonnements.length === 0
          ? 'Coche tes services ci-dessus ou ajoute-en un qui n’est pas dans la liste.'
          : 'Touche un abonnement pour corriger son prix, sa date ou son moyen de paiement.'}
      </p>

      <ul className="mt-4 overflow-hidden rounded-2xl border border-bord bg-surface empty:hidden">
        <AnimatePresence initial={false}>
          {abonnements.map((a) => (
            <motion.li
              key={a.id}
              layout="position"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ type: 'spring', bounce: 0, visualDuration: 0.25 }}
              className="border-b border-bord last:border-b-0"
            >
              <button
                type="button"
                onClick={() => onOuvrir(a.id)}
                className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 active:bg-surface-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{a.nom}</span>
                  <span className="block truncate text-[0.8125rem] text-texte-2">
                    {[
                      libelleCategorie(a.categorie),
                      a.payeVia && libellePayeVia(a.payeVia),
                      a.finEssai && `essai jusqu’au ${formaterDate(a.finEssai)}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                <span className="shrink-0 text-right tabular-nums">
                  <span className="block font-medium">{formaterEuros(a.prixCentimes)}</span>
                  <span className="block text-[0.8125rem] text-texte-2">
                    {infosFrequence(a.frequence).libelle}
                  </span>
                </span>
                <IconeChevron className="shrink-0 text-texte-2/60" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <button
        type="button"
        onClick={onNouveau}
        className="appui mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-texte-2/40 text-[0.9375rem] font-medium text-accent"
      >
        <IconePlus className="text-lg" />
        Autre abonnement
      </button>
    </section>
  )
}
