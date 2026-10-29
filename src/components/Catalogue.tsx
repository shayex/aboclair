import { motion } from 'motion/react'
import { useId, useMemo, useState, type ReactNode } from 'react'
import { coutMensuelCentimes } from '../lib/calculs'
import { CATEGORIES, marques, prixCatalogueCentimes, type Marque } from '../lib/catalogue'
import { formaterEuros, normaliser } from '../lib/format'
import { infosFrequence } from '../lib/libelles'
import type { Abonnement, Categorie } from '../types'
import { IconeChevron, IconeCoche, IconeLoupe } from './ui/Icones'

type Filtre = Categorie | 'populaires' | 'tout'

interface Props {
  /** Abonnement choisi pour chaque marque (par nom de marque). */
  choix: Map<string, Abonnement>
  onToucher: (marque: Marque) => void
  children?: ReactNode
}

const RESSORT = { type: 'spring', bounce: 0, visualDuration: 0.3 } as const

const FILTRES: { id: Filtre; libelle: string }[] = [
  { id: 'populaires', libelle: 'Les plus courants' },
  { id: 'tout', libelle: 'Tout' },
  ...CATEGORIES,
]

export function Catalogue({ choix, onToucher, children }: Props) {
  const [filtre, setFiltre] = useState<Filtre>('populaires')
  const [recherche, setRecherche] = useState('')
  const idTitre = useId()

  const requete = normaliser(recherche)
  const groupes = useMemo(() => {
    if (requete) {
      const trouves = marques.filter((m) =>
        [m.nom, ...m.offres.map((o) => o.nom)].some((n) => normaliser(n).includes(requete)),
      )
      return [{ id: 'resultats', libelle: null, marques: trouves }]
    }
    if (filtre === 'populaires') {
      return [{ id: 'populaires', libelle: null, marques: marques.filter((m) => m.populaire) }]
    }
    return CATEGORIES.filter((c) => filtre === 'tout' || c.id === filtre).map((c) => ({
      id: c.id,
      libelle: filtre === 'tout' ? c.libelle : null,
      marques: marques.filter((m) => m.categorie === c.id),
    }))
  }, [requete, filtre])

  const nbResultats = groupes.reduce((n, g) => n + g.marques.length, 0)

  return (
    <section aria-labelledby={idTitre} className="mt-10">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={idTitre} className="text-[1.375rem] font-semibold leading-tight tracking-[-0.015em]">
          Coche tes abonnements
        </h2>
        {choix.size > 0 && (
          <span className="text-sm font-medium text-texte-2 tabular-nums" aria-live="polite">
            {choix.size} {choix.size > 1 ? 'cochés' : 'coché'}
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
          placeholder="Rechercher : Netflix, Basic-Fit, Free…"
          enterKeyHint="search"
          autoComplete="off"
          className="h-12 w-full rounded-2xl border border-bord bg-surface pl-10 pr-4 text-texte placeholder:text-texte-2/80 outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-4 focus:ring-accent/15"
        />
      </label>

      {!requete && (
        <div
          role="group"
          aria-label="Filtrer le catalogue"
          className="sans-barre -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1"
        >
          {FILTRES.map((c) => {
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
            {g.marques.map((m) => (
              <li key={m.nom}>
                <TuileMarque marque={m} choisi={choix.get(m.nom)} onToucher={() => onToucher(m)} />
              </li>
            ))}
          </ul>
        </div>
      ))}

      {!requete && filtre === 'populaires' && (
        <p className="mt-3 text-[0.875rem] text-texte-2">
          Tu ne trouves pas ton service ?{' '}
          <button type="button" onClick={() => setFiltre('tout')} className="font-medium text-accent">
            Voir tout le catalogue
          </button>{' '}
          ou cherche-le.
        </p>
      )}

      {children}
    </section>
  )
}

/** Prix le plus bas de la marque, dans sa fréquence si toutes les offres ont la même. */
function prixDepart(m: Marque): string {
  const o0 = m.offres[0]
  if (m.offres.length === 1) return `${formaterEuros(prixCatalogueCentimes(o0))}${infosFrequence(o0.frequence).suffixe}`
  const memeFrequence = m.offres.every((o) => o.frequence === o0.frequence)
  const montant = memeFrequence
    ? `${formaterEuros(Math.min(...m.offres.map((o) => prixCatalogueCentimes(o))))}${infosFrequence(o0.frequence).suffixe}`
    : `${formaterEuros(
        Math.min(...m.offres.map((o) => coutMensuelCentimes({ prixCentimes: prixCatalogueCentimes(o), frequence: o.frequence }))),
      )}/mois`
  return `dès ${montant}`
}

function TuileMarque({
  marque,
  choisi,
  onToucher,
}: {
  marque: Marque
  choisi: Abonnement | undefined
  onToucher: () => void
}) {
  const plusieurs = marque.offres.length > 1
  const offreChoisie = choisi && marque.offres.find((o) => o.id === choisi.serviceId)
  // Ligne 1 : l'offre choisie ou le nombre d'offres. Ligne 2 : le prix, jamais coupé.
  const ligneOffre = choisi ? (plusieurs ? offreChoisie?.offre : undefined) : plusieurs ? `${marque.offres.length} offres` : undefined
  const lignePrix = choisi
    ? `${formaterEuros(choisi.prixCentimes)}${infosFrequence(choisi.frequence).suffixe}`
    : prixDepart(marque)

  return (
    <button
      type="button"
      onClick={onToucher}
      aria-pressed={plusieurs ? undefined : Boolean(choisi)}
      aria-haspopup={plusieurs ? 'dialog' : undefined}
      className={`appui relative flex min-h-[4.75rem] w-full flex-col justify-between rounded-2xl border p-3 text-left ${
        choisi ? 'border-accent bg-accent/10' : 'border-bord bg-surface hover:border-texte-2/40'
      }`}
    >
      <span className="pr-7 text-[0.9375rem] font-medium leading-snug">
        {marque.nom}
        {plusieurs && choisi && <span className="sr-only"> (choisi)</span>}
      </span>
      <span className="mt-1 text-[0.8125rem] leading-snug text-texte-2 tabular-nums">
        {ligneOffre && <span className="block truncate">{ligneOffre}</span>}
        <span className="block whitespace-nowrap">{lignePrix}</span>
      </span>
      <span
        className={`absolute right-2.5 top-2.5 grid size-5 place-items-center rounded-full border-[1.5px] transition-colors duration-150 ${
          choisi ? 'border-accent bg-accent text-accent-texte' : plusieurs ? 'border-transparent text-texte-2/70' : 'border-texte-2/40'
        }`}
      >
        {choisi ? (
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0, visualDuration: 0.2 }}
            className="grid place-items-center"
          >
            <IconeCoche className="text-[0.75rem]" />
          </motion.span>
        ) : (
          plusieurs && <IconeChevron className="text-sm" />
        )}
      </span>
    </button>
  )
}
