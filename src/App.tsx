import { useMemo, useState, type ReactNode } from 'react'
import { BarreTotal } from './components/BarreTotal'
import { Catalogue } from './components/Catalogue'
import { EnTete } from './components/EnTete'
import { FicheResiliation } from './components/FicheResiliation'
import { FormulaireAbonnement } from './components/FormulaireAbonnement'
import { ListeAbonnements } from './components/ListeAbonnements'
import { Plan } from './components/Plan'
import { TableauDeBord } from './components/TableauDeBord'
import { Tri } from './components/Tri'
import { Panneau } from './components/ui/Panneau'
import { totaux as calculerTotaux } from './lib/calculs'
import { trouverService } from './lib/catalogue'
import { aujourdhuiIso } from './lib/dates'
import { construirePlan } from './lib/verdict'
import { depuisCatalogue, nouvelId, useAbonnements } from './state/useAbonnements'
import type { Abonnement, ServiceCatalogue } from './types'

type EtatPanneau =
  | { type: 'modifier'; id: string }
  | { type: 'nouveau'; brouillon: Abonnement }
  | { type: 'resilier'; id: string; depuisFiche: boolean }
  | null

function brouillonVide(): Abonnement {
  return { id: nouvelId(), serviceId: null, nom: '', categorie: 'autre', prixCentimes: 0, frequence: 'mensuel' }
}

const BOUTON_SECONDAIRE =
  'appui flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-surface-2 text-[0.9375rem] font-semibold'

export function App() {
  const gestion = useAbonnements()
  const { abonnements } = gestion
  const [panneau, setPanneau] = useState<EtatPanneau>(null)

  const selectionnes = useMemo(
    () => new Set(abonnements.flatMap((a) => (a.serviceId ? [a.serviceId] : []))),
    [abonnements],
  )
  const totaux = useMemo(() => calculerTotaux(abonnements), [abonnements])
  const plan = useMemo(() => construirePlan(abonnements), [abonnements])

  function basculer(service: ServiceCatalogue) {
    const existant = abonnements.find((a) => a.serviceId === service.id)
    if (existant) gestion.supprimer(existant.id)
    else gestion.ajouter(depuisCatalogue(service))
  }

  const enCours =
    panneau && panneau.type !== 'nouveau' ? abonnements.find((a) => a.id === panneau.id) : undefined

  function fermer() {
    // Un nom effacé puis laissé vide reprend le nom du service.
    if (enCours && enCours.nom.trim() === '') {
      gestion.modifier(enCours.id, { nom: trouverService(enCours.serviceId)?.nom ?? 'Abonnement' })
    }
    setPanneau(null)
  }

  function contenuPanneau(): { titre: string; cle: string; corps: ReactNode } | null {
    if (panneau?.type === 'nouveau') {
      const b = panneau.brouillon
      const pret = b.nom.trim() !== '' && b.prixCentimes > 0
      return {
        titre: 'Autre abonnement',
        cle: 'nouveau',
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
    if (!enCours || !panneau) return null
    const nom = enCours.nom.trim() || 'Abonnement'

    if (panneau.type === 'resilier') {
      return {
        titre: `Résilier ${nom}`,
        cle: 'resilier',
        corps: (
          <>
            {panneau.depuisFiche && (
              <button
                type="button"
                onClick={() => setPanneau({ type: 'modifier', id: enCours.id })}
                className="mb-1 mt-1 text-[0.9375rem] font-medium text-accent"
              >
                ‹ Retour aux détails
              </button>
            )}
            <FicheResiliation abonnement={enCours} aujourdhui={aujourdhuiIso()} />
          </>
        ),
      }
    }

    return {
      titre: nom,
      cle: 'modifier',
      corps: (
        <FormulaireAbonnement
          key={enCours.id}
          abonnement={enCours}
          onChanger={(c) => gestion.modifier(enCours.id, c)}
          actions={
            <div className="mt-1 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setPanneau({ type: 'resilier', id: enCours.id, depuisFiche: true })}
                className={BOUTON_SECONDAIRE}
              >
                Comment résilier
              </button>
              <button
                type="button"
                onClick={() => {
                  gestion.supprimer(enCours.id)
                  setPanneau(null)
                }}
                className="appui h-12 w-full rounded-2xl text-[0.9375rem] font-medium text-couper"
              >
                Supprimer cet abonnement
              </button>
            </div>
          }
        />
      ),
    }
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
        <TableauDeBord totaux={totaux} nombre={abonnements.length} />
        <Tri abonnements={abonnements} onUsage={(id, usage) => gestion.modifier(id, { usage })} />
        <Plan
          plan={plan}
          nombre={abonnements.length}
          actionPour={(id, verdict) =>
            verdict === 'partager' ? null : (
              <button
                type="button"
                onClick={() => setPanneau({ type: 'resilier', id, depuisFiche: false })}
                className="appui h-9 shrink-0 rounded-full bg-surface-2 px-3.5 text-sm font-semibold"
              >
                Résilier
              </button>
            )
          }
        />
      </main>
      <BarreTotal totaux={totaux} nombre={abonnements.length} />
      <Panneau ouvert={contenu !== null} onFermer={fermer} titre={contenu?.titre ?? ''} cleContenu={contenu?.cle}>
        {contenu?.corps}
      </Panneau>
    </>
  )
}
