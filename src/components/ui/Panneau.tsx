import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from 'motion/react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  ouvert: boolean
  onFermer: () => void
  titre: string
  children: ReactNode
  /** Change quand le contenu change (ex. passer de la fiche à la résiliation). */
  cleContenu?: string
}

const OUVERTURE = { type: 'spring', bounce: 0, visualDuration: 0.36 } as const
const FERMETURE = { type: 'spring', bounce: 0, visualDuration: 0.28 } as const

/** Projection de l'élan (même formule que le défilement natif). */
function projeter(vitesse: number, deceleration = 0.998) {
  return ((vitesse / 1000) * deceleration) / (1 - deceleration)
}

/** Panneau qui monte du bas de l'écran. Se ferme en le tirant vers le bas, avec Échap ou en touchant le fond. */
export function Panneau(props: Props) {
  return createPortal(
    <AnimatePresence>{props.ouvert && <PanneauOuvert {...props} />}</AnimatePresence>,
    document.body,
  )
}

function PanneauOuvert({ onFermer, titre, children, cleContenu }: Props) {
  const controles = useDragControls()
  const reduit = useReducedMotion()
  const idTitre = useId()
  const refPanneau = useRef<HTMLDivElement>(null)
  const refFermer = useRef(onFermer)
  refFermer.current = onFermer

  useEffect(() => {
    const precedent = document.activeElement as HTMLElement | null
    const racine = document.getElementById('root')
    if (racine) racine.inert = true
    const html = document.documentElement
    const debordement = html.style.overflow
    html.style.overflow = 'hidden'
    refPanneau.current?.focus({ preventScroll: true })
    const touche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') refFermer.current()
    }
    document.addEventListener('keydown', touche)
    return () => {
      if (racine) racine.inert = false
      html.style.overflow = debordement
      document.removeEventListener('keydown', touche)
      precedent?.focus({ preventScroll: true })
    }
  }, [])

  function finGlisser(_: PointerEvent, info: PanInfo) {
    const hauteur = refPanneau.current?.offsetHeight ?? 600
    const arrivee = info.offset.y + projeter(info.velocity.y)
    if (arrivee > hauteur * 0.45) onFermer()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onFermer}
        aria-hidden="true"
      />
      <motion.div
        ref={refPanneau}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitre}
        tabIndex={-1}
        initial={reduit ? { opacity: 0 } : { y: '100%' }}
        animate={reduit ? { opacity: 1 } : { y: 0, transition: OUVERTURE }}
        exit={reduit ? { opacity: 0 } : { y: '100%', transition: FERMETURE }}
        drag="y"
        dragListener={false}
        dragControls={controles}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.04, bottom: 1 }}
        dragTransition={{ bounceStiffness: 500, bounceDamping: 40 }}
        onDragEnd={finGlisser}
        className="relative flex max-h-[92dvh] w-full max-w-xl flex-col rounded-t-[1.75rem] bg-surface shadow-[0_-8px_40px_rgb(0_0_0/0.18)] outline-none after:absolute after:inset-x-0 after:top-full after:h-[40vh] after:bg-surface"
      >
        <div
          onPointerDown={(e) => controles.start(e)}
          className="flex shrink-0 cursor-grab touch-none flex-col items-center px-5 pb-2 pt-2.5 active:cursor-grabbing"
        >
          <span className="h-[5px] w-9 rounded-full bg-texte-2/30" aria-hidden="true" />
          <div className="mt-2.5 flex w-full items-center justify-between gap-3">
            <h2 id={idTitre} className="min-w-0 truncate text-lg font-semibold tracking-[-0.01em]">
              {titre}
            </h2>
            <button
              type="button"
              onClick={onFermer}
              onPointerDown={(e) => e.stopPropagation()}
              className="appui h-9 shrink-0 rounded-full bg-surface-2 px-4 text-[0.9375rem] font-semibold"
            >
              OK
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={cleContenu ?? 'contenu'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
