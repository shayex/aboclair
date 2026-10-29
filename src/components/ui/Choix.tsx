import { motion } from 'motion/react'
import { useId } from 'react'

interface Option<T extends string> {
  valeur: T
  libelle: string
}

/** Choix segmenté (boutons radio) avec une pastille qui glisse vers l'option choisie. */
export function ChoixSegmente<T extends string>({
  legende,
  options,
  valeur,
  onChanger,
  masquerLegende = false,
}: {
  legende: string
  options: Option<T>[]
  valeur: T | undefined
  onChanger: (v: T) => void
  masquerLegende?: boolean
}) {
  const nom = useId()
  return (
    <fieldset>
      <legend className={masquerLegende ? 'sr-only' : 'mb-1.5 text-sm font-medium text-texte-2'}>
        {legende}
      </legend>
      <div className="flex rounded-xl bg-surface-2 p-1">
        {options.map((o) => {
          const actif = o.valeur === valeur
          return (
            <label
              key={o.valeur}
              className="relative flex h-9 flex-1 cursor-pointer items-center justify-center rounded-lg text-[0.9375rem] font-medium has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
            >
              <input
                type="radio"
                name={nom}
                value={o.valeur}
                checked={actif}
                onChange={() => onChanger(o.valeur)}
                className="sr-only"
              />
              {actif && (
                <motion.span
                  layoutId={`${nom}-pastille`}
                  transition={{ type: 'spring', bounce: 0, visualDuration: 0.28 }}
                  className="absolute inset-0 rounded-lg bg-surface shadow-[0_1px_3px_rgb(0_0_0/0.12)]"
                />
              )}
              <span className={`relative ${actif ? 'text-texte' : 'text-texte-2'}`}>{o.libelle}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Puces à choix unique (boutons radio), sur plusieurs lignes. */
export function ChoixPuces<T extends string>({
  legende,
  options,
  valeur,
  onChanger,
}: {
  legende: string
  options: Option<T>[]
  valeur: T | undefined
  onChanger: (v: T) => void
}) {
  const nom = useId()
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-texte-2">{legende}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const actif = o.valeur === valeur
          return (
            <label
              key={o.valeur}
              className={`appui flex h-9 cursor-pointer items-center rounded-full border px-3.5 text-sm font-medium has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                actif ? 'border-accent bg-accent/12 text-accent' : 'border-bord bg-surface text-texte'
              }`}
            >
              <input
                type="radio"
                name={nom}
                value={o.valeur}
                checked={actif}
                onChange={() => onChanger(o.valeur)}
                className="sr-only"
              />
              {o.libelle}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Interrupteur on/off. */
export function Interrupteur({
  libelle,
  actif,
  onChanger,
}: {
  libelle: string
  actif: boolean
  onChanger: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      onClick={() => onChanger(!actif)}
      className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-[0.9375rem] font-medium"
    >
      {libelle}
      <span
        className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200 ${
          actif ? 'bg-garder' : 'bg-texte-2/30'
        }`}
      >
        <motion.span
          className="absolute left-[2px] top-[2px] size-[27px] rounded-full bg-white shadow-[0_2px_4px_rgb(0_0_0/0.2)]"
          animate={{ x: actif ? 20 : 0 }}
          transition={{ type: 'spring', bounce: 0, visualDuration: 0.25 }}
        />
      </span>
    </button>
  )
}
