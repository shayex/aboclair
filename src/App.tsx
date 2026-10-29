import { useMemo, useState } from 'react'
import { Catalogue } from './components/Catalogue'
import { EnTete } from './components/EnTete'
import { FormulaireAbonnement } from './components/FormulaireAbonnement'
import { ListeAbonnements } from './components/ListeAbonnements'
import { Panneau } from './components/ui/Panneau'
import { trouverService } from './lib/catalogue'
import { depuisCatalogue, nouvelId, useAbonnements } from './state/useAbonnements'
import type { Abonnement, ServiceCatalogue } from './types'

type EtatPanneau =
  | { type: 'modifier'; id: string }
  | { type: 'nouveau'; brouillon: Abonnement }
  | null

function brouillonVide(): Abonnement {
  return { id: nouvelId(), serviceId: null, nom: '', categorie: 'autre', prixCentimes: 0, frequence: 'mensuel' }
}

export function App() {
  const gestion = useAbonnements()
  const { abonnements } = gestion
  const [panneau, setPanneau] = useState<EtatPanneau>(null)

  const selectionnes = useMemo(
    () => new Set(abonnements.flatMap((a) => (a.serviceId ? [a.serviceId] : []))),
    [abonnements],
  )

  function basculer(service: ServiceCatalogue) {
    const existant = abonnements.find((a) => a.serviceId === service.id)
    if (existant) gestion.supprimer(existant.id)
    else gestion.ajouter(depuisCatalogue(service))
  }

  const enCours = panneau?.type === 'modifier' ? abonnements.find((a) => a.id === panneau.id) : undefined

  function fermer() {
    // Un nom effacé puis laissé vide reprend le nom du service.
    if (enCours && enCours.nom.trim() === '') {
      gestion.modifier(enCours.id, { nom: trouverService(enCours.serviceId)?.nom ?? 'Abonnement' })
    }
    setPanneau(null)
  }

  function contenuPanneau() {
    if (panneau?.type === 'nouveau') {
      const b = panneau.brouillon
      const pret = b.nom.trim() !== '' && b.prixCentimes > 0
      return {
        titre: 'Autre abonnement',
        corps: (
          <FormulaireAbonnement
            key={b.id}
            abonnement={b}
            focusNom
            onChanger={(c) => setPanneau({ type: 'nouveau', brouillon: { ...b, ...c } })}
            actions={
              <button
                type="button"
                disabled={!pret}
                onClick={() => {
                  gestion.ajouter({ ...b, nom: b.nom.trim() })
                  setPanneau(null)
                }}
                className="appui mt-1 h-12 w-full rounded-2xl bg-accent text-base font-semibold text-accent-texte disabled:opacity-40"
              >
                Ajouter cet abonnement
              </button>
            }
          />
        ),
      }
    }
    if (enCours) {
      return {
        titre: enCours.nom.trim() || 'Abonnement',
        corps: (
          <FormulaireAbonnement
            key={enCours.id}
            abonnement={enCours}
            onChanger={(c) => gestion.modifier(enCours.id, c)}
            actions={
              <button
                type="button"
                onClick={() => {
                  gestion.supprimer(enCours.id)
                  setPanneau(null)
                }}
                className="appui mt-2 h-12 w-full rounded-2xl text-[0.9375rem] font-medium text-couper"
              >
                Supprimer cet abonnement
              </button>
            }
          />
        ),
      }
    }
    return null
  }

  const contenu = contenuPanneau()

  return (
    <>
      <main className="mx-auto max-w-xl px-4 pb-[calc(env(safe-area-inset-bottom)+7rem)]">
        <EnTete />
        <Catalogue selectionnes={selectionnes} onBasculer={basculer} />
        <ListeAbonnements
          abonnements={abonnements}
          onOuvrir={(id) => setPanneau({ type: 'modifier', id })}
          onNouveau={() => setPanneau({ type: 'nouveau', brouillon: brouillonVide() })}
        />
      </main>
      <Panneau ouvert={contenu !== null} onFermer={fermer} titre={contenu?.titre ?? ''}>
        {contenu?.corps}
      </Panneau>
    </>
  )
}

