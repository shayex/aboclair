const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const eurosArrondis = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

/** 1299 → « 12,99 € ». Avec arrondi : 163188 → « 1 632 € ». */
export function formaterEuros(centimes: number, arrondi = false): string {
  return (arrondi ? eurosArrondis : euros).format(centimes / 100)
}

const dateLongue = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/** « 2026-11-12 » → « 12 novembre 2026 » */
export function formaterDate(iso: string): string {
  const texte = dateLongue.format(new Date(`${iso}T00:00:00Z`))
  return texte.startsWith('1 ') ? `1er ${texte.slice(2)}` : texte
}

/** Pour la recherche : minuscules, sans accents. */
export function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .toLowerCase()
    .trim()
}
