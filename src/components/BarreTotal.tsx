import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import type { Totaux } from '../lib/calculs'
import { formaterEuros } from '../lib/format'
import { ID_BILAN } from './TableauDeBord'

/** Barre flottante en bas de l'écran : le total reste visible pendant qu'on coche. */
export function BarreTotal({ totaux, nombre }: { totaux: Totaux; nombre: number }) {
  const [bilanVisible, setBilanVisible] = useState(false)
  const reduit = useReducedMotion()

  useEffect(() => {
    const cible = document.getElementById(ID_BILAN)
    if (!cible) return
    const obs = new IntersectionObserver(([e]) => setBilanVisible(e.isIntersecting), { threshold: 0.15 })
    obs.observe(cible)
    return () => obs.disconnect()
  }, [nombre > 0])

  function allerAuBilan() {
    const cible = document.getElementById(ID_BILAN)
    cible?.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'start' })
    cible?.querySelector('h2')?.focus({ preventScroll: true })
  }

  const visible = nombre > 0 && !bilanVisible

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '120%' }}
          animate={{ y: 0 }}
          exit={{ y: '120%' }}
          transition={{ type: 'spring', bounce: 0, visualDuration: 0.32 }}
          className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <div className="verre mx-auto flex max-w-xl items-center gap-3 rounded-[1.375rem] border border-bord py-2 pl-4 pr-2 shadow-[0_8px_30px_rgb(0_0_0/0.14)]">
            <p className="min-w-0 flex-1 leading-tight" aria-live="polite">
              <span className="block text-lg font-bold tracking-[-0.02em] tabular-nums">
                {formaterEuros(totaux.annuel, true)} <span className="text-sm font-semibold text-texte-2">par an</span>
              </span>
              <span className="block text-[0.8125rem] text-texte-2 tabular-nums">
                soit {formaterEuros(totaux.mensuel)} par mois
              </span>
            </p>
            <button
              type="button"
              onClick={allerAuBilan}
              className="appui h-11 shrink-0 rounded-2xl bg-accent px-4 text-[0.9375rem] font-semibold text-accent-texte"
            >
              Voir mon bilan
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
