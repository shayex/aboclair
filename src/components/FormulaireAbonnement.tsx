import { useId, useState, type ReactNode } from 'react'
import { CATEGORIES, prixCatalogueCentimes, trouverService } from '../lib/catalogue'
import {
  centimesVersSaisie,
  coutAnnuelCentimes,
  coutMensuelCentimes,
  eurosVersCentimes,
  prixApresChangementFrequence,
} from '../lib/calculs'
import { formaterEuros } from '../lib/format'
import { FREQUENCES, infosFrequence, PAYE_VIA } from '../lib/libelles'
import type { Abonnement, Categorie, Frequence } from '../types'
import { ChoixPuces, ChoixSegmente, Interrupteur } from './ui/Choix'

interface Props {
  abonnement: Abonnement
  onChanger: (changements: Partial<Abonnement>) => void
  /** Boutons d'action affichés sous les champs (résilier, rappel, supprimer…). */
  actions?: ReactNode
  /** Mettre le focus sur le nom à l'ouverture (abonnement personnalisé). */
  focusNom?: boolean
}

const CLASSE_CHAMP =
  'h-12 w-full rounded-xl border border-bord bg-fond px-3.5 text-texte outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-4 focus:ring-accent/15 aria-[invalid=true]:border-couper'

export function FormulaireAbonnement({ abonnement: a, onChanger, actions, focusNom }: Props) {
  const service = trouverService(a.serviceId)
  const [saisiePrix, setSaisiePrix] = useState(() =>
    a.serviceId === null && a.prixCentimes === 0 ? '' : centimesVersSaisie(a.prixCentimes),
  )
  const [essaiOuvert, setEssaiOuvert] = useState(a.finEssai !== undefined)
  const idPrix = useId()
  const idAidePrix = useId()
  const prixValide = eurosVersCentimes(saisiePrix) !== null
  const prixEnErreur = !prixValide && saisiePrix.trim() !== ''

  function changerPrix(texte: string) {
    setSaisiePrix(texte)
    const centimes = eurosVersCentimes(texte)
    if (centimes !== null) onChanger({ prixCentimes: centimes })
  }

  function changerFrequence(frequence: Frequence) {
    const prixCentimes = prixApresChangementFrequence(a, frequence, service)
    setSaisiePrix(centimesVersSaisie(prixCentimes))
    onChanger({ frequence, prixCentimes })
  }

  function basculerEssai(actif: boolean) {
    setEssaiOuvert(actif)
    if (!actif) onChanger({ finEssai: undefined })
  }

  const equivalent =
    a.frequence === 'annuel'
      ? `soit ${formaterEuros(coutMensuelCentimes(a))} par mois`
      : a.frequence === '4-semaines'
        ? `13 prélèvements par an, soit ${formaterEuros(coutAnnuelCentimes(a))} par an`
        : `soit ${formaterEuros(coutAnnuelCentimes(a))} par an`

  return (
    <div className="flex flex-col gap-5 pb-2 pt-2">
      <Champ libelle="Nom">
        {(id) => (
          <input
            id={id}
            type="text"
            value={a.nom}
            onChange={(e) => onChanger({ nom: e.target.value })}
            autoFocus={focusNom}
            autoComplete="off"
            placeholder="Ex. : salle de sport, appli de méditation…"
                        className={CLASSE_CHAMP}
          />
        )}
      </Champ>

      {a.serviceId === null && (
        <Champ libelle="Catégorie">
          {(id) => (
            <select
              id={id}
              value={a.categorie}
              onChange={(e) => onChanger({ categorie: e.target.value as Categorie | 'autre' })}
              className={`${CLASSE_CHAMP} appearance-none`}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.libelle}
                </option>
              ))}
              <option value="autre">Autre</option>
            </select>
          )}
        </Champ>
      )}

      <div>
        <label htmlFor={idPrix} className="mb-1.5 block text-sm font-medium text-texte-2">
          Prix à chaque prélèvement
        </label>
        <div className="relative">
          <input
            id={idPrix}
            type="text"
            inputMode="decimal"
            value={saisiePrix}
            onChange={(e) => changerPrix(e.target.value)}
            onFocus={(e) => e.target.select()}
            aria-invalid={prixEnErreur}
            placeholder="0,00"
            aria-describedby={idAidePrix}
            className={`${CLASSE_CHAMP} pr-9 tabular-nums`}
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-texte-2">€</span>
        </div>
        <div className="mt-2">
          <ChoixSegmente
            legende="Fréquence de prélèvement"
            masquerLegende
            options={FREQUENCES.map((f) => ({ valeur: f.valeur, libelle: f.court === '4 sem.' ? '4 semaines' : f.libelle }))}
            valeur={a.frequence}
            onChanger={changerFrequence}
          />
        </div>
      </div>
      <p id={idAidePrix} className={`-mt-3.5 text-sm ${prixEnErreur ? 'text-couper' : 'text-texte-2'}`}>
        {prixValide ? equivalent : 'Entre un montant, par exemple 9,99.'}
        {service && prixValide && (
          <span className="block text-[0.8125rem]">
            Prix du catalogue : {formaterEuros(prixCatalogueCentimes(service, a.frequence))}
            {infosFrequence(a.frequence).suffixe}, indicatif (octobre 2026). Vérifie-le sur ton relevé.
          </span>
        )}
      </p>

      <Champ libelle="Prochain renouvellement" aide="La date du prochain prélèvement.">
        {(id, idAide) => (
          <input
            id={id}
            type="date"
            value={a.dateRenouvellement ?? ''}
            onChange={(e) => onChanger({ dateRenouvellement: e.target.value || undefined })}
            aria-describedby={idAide}
            className={CLASSE_CHAMP}
          />
        )}
      </Champ>

      <ChoixPuces
        legende="Payé via"
        options={PAYE_VIA}
        valeur={a.payeVia}
        onChanger={(payeVia) => onChanger({ payeVia })}
      />

      <div className="rounded-2xl bg-fond px-4 py-1">
        <Interrupteur libelle="C’est un essai gratuit" actif={essaiOuvert} onChanger={basculerEssai} />
        {essaiOuvert && (
          <div className="pb-3 pt-1">
            <Champ libelle="Fin de l’essai" aide="Avant cette date, tu peux résilier sans rien payer.">
              {(id, idAide) => (
                <input
                  id={id}
                  type="date"
                  value={a.finEssai ?? ''}
                  onChange={(e) => onChanger({ finEssai: e.target.value || undefined })}
                  aria-describedby={idAide}
                  className={`${CLASSE_CHAMP} bg-surface`}
                />
              )}
            </Champ>
          </div>
        )}
      </div>

      {actions}
    </div>
  )
}

function Champ({
  libelle,
  aide,
  children,
}: {
  libelle: string
  aide?: string
  children: (id: string, idAide: string | undefined) => ReactNode
}) {
  const id = useId()
  const idAide = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-texte-2">
        {libelle}
      </label>
      {children(id, aide ? idAide : undefined)}
      {aide && (
        <p id={idAide} className="mt-1.5 text-[0.8125rem] text-texte-2">
          {aide}
        </p>
      )}
    </div>
  )
}
