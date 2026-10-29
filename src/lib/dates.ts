/** Les dates sont manipulées en texte « AAAA-MM-JJ », sans fuseau horaire, pour éviter les décalages d'un jour. */

export function aujourdhuiIso(maintenant = new Date()): string {
  const a = maintenant.getFullYear()
  const m = String(maintenant.getMonth() + 1).padStart(2, '0')
  const j = String(maintenant.getDate()).padStart(2, '0')
  return `${a}-${m}-${j}`
}

function versDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`)
}

function versIso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function ajouterJours(iso: string, jours: number): string {
  const d = versDate(iso)
  d.setUTCDate(d.getUTCDate() + jours)
  return versIso(d)
}

/** Ajoute des mois en restant sur le dernier jour du mois si besoin (31 janvier + 1 mois = 28 ou 29 février). */
export function ajouterMois(iso: string, mois: number): string {
  const [a, m, j] = iso.split('-').map(Number)
  const cible = new Date(Date.UTC(a, m - 1 + mois, 1))
  const dernierJour = new Date(Date.UTC(cible.getUTCFullYear(), cible.getUTCMonth() + 1, 0)).getUTCDate()
  cible.setUTCDate(Math.min(j, dernierJour))
  return versIso(cible)
}
