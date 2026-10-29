import { formaterEuros } from '../lib/format'
import { prixCatalogueCentimes, type Marque } from '../lib/catalogue'
import { infosFrequence } from '../lib/libelles'
import type { Abonnement, ServiceCatalogue } from '../types'
import { IconeCoche } from './ui/Icones'
import { LogoMarque } from './ui/LogoMarque'

/** Liste des offres d'une marque : toucher une offre la choisit et ferme le panneau. */
export function ChoixOffre({
  marque,
  choisi,
  onChoisir,
  onRetirer,
}: {
  marque: Marque
  choisi: Abonnement | undefined
  onChoisir: (offre: ServiceCatalogue) => void
  onRetirer: () => void
}) {
  return (
    <div className="flex flex-col gap-4 pb-2 pt-1">
      <div className="flex items-center gap-3">
        <LogoMarque nom={marque.nom} taille={40} />
        <p className="text-[0.9375rem] text-texte-2">Quelle offre as-tu ? Les prix sont indicatifs.</p>
      </div>
      <ul className="overflow-hidden rounded-2xl border border-bord" role="list">
        {marque.offres.map((o) => {
          const actif = choisi?.serviceId === o.id
          return (
            <li key={o.id} className="border-b border-bord last:border-b-0">
              <button
                type="button"
                onClick={() => onChoisir(o)}
                aria-current={actif ? 'true' : undefined}
                className={`flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 active:bg-surface-2 ${
                  actif ? 'bg-accent/10' : ''
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{o.offre ?? o.nom}</span>
                  <span className="block text-[0.8125rem] text-texte-2 tabular-nums">
                    {formaterEuros(prixCatalogueCentimes(o))} {infosFrequence(o.frequence).libelle}
                  </span>
                </span>
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full ${
                    actif ? 'bg-accent text-accent-texte' : 'border-[1.5px] border-texte-2/40'
                  }`}
                  aria-hidden="true"
                >
                  {actif && <IconeCoche className="text-[0.8125rem]" />}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {choisi && (
        <button
          type="button"
          onClick={onRetirer}
          className="appui h-12 w-full rounded-2xl text-[0.9375rem] font-medium text-couper"
        >
          Retirer {marque.nom}
        </button>
      )}
    </div>
  )
}
