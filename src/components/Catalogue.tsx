import { motion } from 'motion/react'
import { useId, useMemo, useState, type ReactNode } from 'react'
import { CATEGORIES, catalogue, prixCatalogueCentimes } from '../lib/catalogue'
import { formaterEuros, normaliser } from '../lib/format'
import type { Categorie, ServiceCatalogue } from '../types'
import { IconeCoche, IconeLoupe } from './ui/Icones'

type Filtre = Categorie | 'tout'

interface Props {
  selectionnes: Set<string>
  onBasculer: (service: ServiceCatalogue) => void
  children?: ReactNode
}

const RESSORT = { type: 'spring', bounce: 0, visualDuration: 0.3 } as const

export function Catalogue({ selectionnes, onBasculer, children }: Props) {
  const [filtre, setFiltre] = useState<Filtre>('tout')
  const [recherche, setRecherche] = useState('')
  const idTitre = useId()

  const requete = normaliser(recherche)
  const groupes = useMemo(() => {
    if (requete) {
      const trouves = catalogue.filter((s) => normaliser(s.nom).includes(requete))
      return [{ id: 'resultats', libelle: null, services: trouves }]
    }
    return CATEGORIES.filter((c) => filtre === 'tout' || c.id === filtre).map((c) => ({
      id: c.id,
      libelle: filtre === 'tout' ? c.libelle : null,
      services: catalogue.filter((s) => s.categorie === c.id),
    }))
  }, [requete, filtre])

  const nbResultats = groupes.reduce((n, g) => n + g.services.length, 0)

  return (
    <section aria-labelledby={idTitre} className="mt-10">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={idTitre} className="text-[1.375rem] font-semibold leading-tight tracking-[-0.015em]">
          Coche tes abonnements
        </h2>
        {selectionnes.size > 0 && (
          <span className="text-sm font-medium text-texte-2 tabular-nums" aria-live="polite">
            {selectionnes.size} {selectionnes.size > 1 ? 'cochés' : 'coché'}
          </span>
        )}
      </div>
      <p className="mt-1 text-[0.9375rem] text-texte-2">
        Les prix sont indicatifs : tu pourras les corriger ensuite.
      </p>

      <label className="relative mt-4 block">
        <span className="sr-only">Rechercher un service</span>
        <IconeLoupe className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[1.125rem] text-texte-2" />
        <input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher : Netflix, Spotify, Free…"
          enterKeyHint="search"
          autoComplete="off"
          className="h-12 w-full rounded-2xl border border-bord bg-surface pl-10 pr-4 text-texte placeholder:text-texte-2/80 outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-4 focus:ring-accent/15"
        />
      </label>

      {!requete && (
        <div
          role="group"
          aria-label="Filtrer par catégorie"
          className="sans-barre -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1"
        >
          {[{ id: 'tout' as const, libelle: 'Tout' }, ...CATEGORIES].map((c) => {
            const actif = filtre === c.id
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={actif}
                onClick={() => setFiltre(c.id)}
                className={`appui relative h-9 shrink-0 rounded-full px-3.5 text-sm font-medium ${
                  actif ? 'text-accent-texte' : 'bg-surface-2 text-texte'
                }`}
              >
                {actif && (
                  <motion.span
                    layoutId="filtre-actif"
                    transition={RESSORT}
                    className="absolute inset-0 rounded-full bg-accent"
                  />
                )}
                <span className="relative">{c.libelle}</span>
              </button>
            )
          })}
        </div>
      )}

      {requete && (
        <p className="mt-3 text-sm text-texte-2" aria-live="polite">
          {nbResultats === 0
            ? 'Aucun service trouvé. Ajoute-le toi-même avec « Autre abonnement ».'
            : `${nbResultats} ${nbResultats > 1 ? 'services trouvés' : 'service trouvé'}`}
        </p>
      )}

      {groupes.map((g) => (
        <div key={g.id} className="mt-5">
          {g.libelle && (
            <h3 className="mb-2 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-texte-2">
              {g.libelle}
            </h3>
          )}
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {g.services.map((s) => (
              <li key={s.id}>
                <TuileService
                  service={s}
                  coche={selectionnes.has(s.id)}
                  onBasculer={() => onBasculer(s)}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}

      {children}
    </section>
  )
}

function TuileService({
  service,
  coche,
  onBasculer,
}: {
  service: ServiceCatalogue
  coche: boolean
  onBasculer: () => void
}) {
  const prix = prixCatalogueCentimes(service, service.frequence)
  const suffixe = service.frequence === 'annuel' ? '/an' : '/mois'
  return (
    <button
      type="button"
      aria-pressed={coche}
      onClick={onBasculer}
      className={`appui relative flex min-h-[4.75rem] w-full flex-col justify-between rounded-2xl border p-3 text-left ${
        coche ? 'border-accent bg-accent/10' : 'border-bord bg-surface hover:border-texte-2/40'
      }`}
    >
      <span className="pr-7 text-[0.9375rem] font-medium leading-snug">{service.nom}</span>
      <span className="mt-1 text-[0.8125rem] text-texte-2 tabular-nums">
        {formaterEuros(prix)}
        {suffixe}
      </span>
      <span
        className={`absolute right-2.5 top-2.5 grid size-5 place-items-center rounded-full border-[1.5px] transition-colors duration-150 ${
          coche ? 'border-accent bg-accent text-accent-texte' : 'border-texte-2/40'
        }`}
      >
        {coche && (
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0, visualDuration: 0.2 }}
            className="grid place-items-center"
          >
            <IconeCoche className="text-[0.75rem]" />
          </motion.span>
        )}
      </span>
    </button>
  )
}
