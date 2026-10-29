import { useId, type ReactNode } from 'react'

/** Section de la page avec un titre et une phrase d'introduction. */
export function Section({
  titre,
  intro,
  id,
  children,
}: {
  titre: string
  intro?: ReactNode
  id?: string
  children: ReactNode
}) {
  const idTitre = useId()
  return (
    <section id={id} aria-labelledby={idTitre} className="mt-12 scroll-mt-6">
      <h2
        id={idTitre}
        tabIndex={-1}
        className="text-[1.375rem] font-semibold leading-tight tracking-[-0.015em] outline-none"
      >
        {titre}
      </h2>
      {intro && <p className="mt-1 text-[0.9375rem] text-texte-2">{intro}</p>}
      {children}
    </section>
  )
}

export function PastilleVerdict({ libelle, couleur }: { libelle: string; couleur: string }) {
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[0.8125rem] font-semibold ${couleur}`}>
      {libelle}
    </span>
  )
}
