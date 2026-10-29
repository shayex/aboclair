import { animate, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { formaterEuros } from '../../lib/format'

/**
 * Montant qui défile jusqu'à sa nouvelle valeur. Le texte lu par les lecteurs d'écran
 * est toujours la valeur finale.
 */
export function Montant({ centimes, arrondi = false, className }: { centimes: number; arrondi?: boolean; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const affiche = useRef(centimes)
  const reduit = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduit) {
      affiche.current = centimes
      el.textContent = formaterEuros(centimes, arrondi)
      return
    }
    // Part de la valeur affichée à l'écran : une nouvelle saisie reprend en douceur.
    const controle = animate(affiche.current, centimes, {
      type: 'spring',
      bounce: 0,
      visualDuration: 0.5,
      onUpdate: (v) => {
        affiche.current = v
        el.textContent = formaterEuros(Math.round(v), arrondi)
      },
    })
    return () => controle.stop()
  }, [centimes, arrondi, reduit])

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true">
        {formaterEuros(affiche.current, arrondi)}
      </span>
      <span className="sr-only">{formaterEuros(centimes, arrondi)}</span>
    </span>
  )
}
