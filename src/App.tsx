import { useMemo, useState, type ReactNode } from 'react'
import { BarreTotal } from './components/BarreTotal'
import { BoutonRappel } from './components/BoutonRappel'
import { Catalogue } from './components/Catalogue'
import { ChoixOffre } from './components/ChoixOffre'
import { EnTete } from './components/EnTete'
import { FicheResiliation } from './components/FicheResiliation'
import { FormulaireAbonnement } from './components/FormulaireAbonnement'
import { ListeAbonnements } from './components/ListeAbonnements'
import { PiedDePage } from './components/PiedDePage'
import { Plan } from './components/Plan'
import { Sauvegarde } from './components/Sauvegarde'
import { TableauDeBord } from './components/TableauDeBord'
import { Tri } from './components/Tri'
import { Panneau } from './components/ui/Panneau'
import { totaux as calculerTotaux } from './lib/calculs'
import { prixCatalogueCentimes, trouverMarque, trouverService, type Marque } from './lib/catalogue'
import { aujourdhuiIso } from './lib/dates'
import { construirePlan } from './lib/verdict'
import { depuisCatalogue, nouvelId, useAbonnements } from './state/useAbonnements'
import type { Abonnement, ServiceCatalogue } from './types'

type EtatPanneau =
  | { type: 'modifier'; id: string }
  | { type: 'nouveau'; brouillon: Abonnement }
  | { type: 'resilier'; id: string; depuisFiche: boolean }
  | { type: 'offres'; marque: string }
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

  // Abonnement choisi pour chaque marque du catalogue.
  const choix = useMemo(() => {
    const m = new Map<string, Abonnement>()
    for (const a of abonnements) {
      const s = trouverService(a.serviceId)
      if (s && !m.has(s.marque)) m.set(s.marque, a)
    }
    return m
  }, [abonnements])
  const totaux = useMemo(() => calculerTotaux(abonnements), [abonnements])
  const plan = useMemo(() => construirePlan(abonnements), [abonnements])

  /** Une seule offre : on coche ou décoche. Plusieurs offres : on ouvre le choix. */
  function toucherMarque(m: Marque) {
    const existant = choix.get(m.nom)
    if (m.offres.length > 1) setPanneau({ type: 'offres', marque: m.nom })
    else if (existant) gestion.supprimer(existant.id)
    else gestion.ajouter(depuisCatalogue(m.offres[0]))
  }

  function choisirOffre(offre: ServiceCatalogue) {
    const existant = choix.get(offre.marque)
    if (!existant) gestion.ajouter(depuisCatalogue(offre))
    else if (existant.serviceId !== offre.id) {
      // Changer d'offre garde les dates et le moyen de paiement, mais reprend le prix du catalogue.
      gestion.modifier(existant.id, {
        serviceId: offre.id,
        nom: offre.nom,
        prixCentimes: prixCatalogueCentimes(offre),
        frequence: offre.frequence,
      })
    }
    setPanneau(null)
  }

  const enCours =
    panneau && (panneau.type === 'modifier' || panneau.type === 'resilier')
      ? abonnements.find((a) => a.id === panneau.id)
      : undefined

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
    if (panneau?.type === 'offres') {
      const m = trouverMarque(panneau.marque)
      if (!m) return null
      const choisi = choix.get(m.nom)
      return {
        titre: m.nom,
        cle: 'offres',
        corps: (
          <ChoixOffre
            marque={m}
            choisi={choisi}
            onChoisir={choisirOffre}
            onRetirer={() => {
              if (choisi) gestion.supprimer(choisi.id)
              setPanneau(null)
            }}
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
            <FicheResiliation
              abonnement={enCours}
              aujourdhui={aujourdhuiIso()}
              rappel={enCours.finEssai ? <BoutonRappel abonnement={enCours} aujourdhui={aujourdhuiIso()} /> : null}
            />
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
              <BoutonRappel abonnement={enCours} aujourdhui={aujourdhuiIso()} />
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
        <Catalogue choix={choix} onToucher={toucherMarque} />
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
        <Sauvegarde donnees={gestion.donnees} stockageOk={gestion.stockageOk} onRemplacer={gestion.remplacer} />
        <PiedDePage />
      </main>
      <BarreTotal totaux={totaux} nombre={abonnements.length} />
      <Panneau ouvert={contenu !== null} onFermer={fermer} titre={contenu?.titre ?? ''} cleContenu={contenu?.cle}>
        {contenu?.corps}
      </Panneau>
    </>
  )
}
