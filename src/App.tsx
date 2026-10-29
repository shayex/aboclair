import { useMemo } from 'react'
import { Catalogue } from './components/Catalogue'
import { EnTete } from './components/EnTete'
import { depuisCatalogue, useAbonnements } from './state/useAbonnements'
import type { ServiceCatalogue } from './types'

export function App() {
  const gestion = useAbonnements()
  const { abonnements } = gestion

  const selectionnes = useMemo(
    () => new Set(abonnements.flatMap((a) => (a.serviceId ? [a.serviceId] : []))),
    [abonnements],
  )

  function basculer(service: ServiceCatalogue) {
    const existant = abonnements.find((a) => a.serviceId === service.id)
    if (existant) gestion.supprimer(existant.id)
    else gestion.ajouter(depuisCatalogue(service))
  }

  return (
    <main className="mx-auto max-w-xl px-4 pb-[calc(env(safe-area-inset-bottom)+7rem)]">
      <EnTete />
      <Catalogue selectionnes={selectionnes} onBasculer={basculer} />
    </main>
  )
}
