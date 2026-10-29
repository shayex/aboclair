/** Trouve les icônes déclarées dans le HTML d'une page, de la plus adaptée à la moins adaptée. */
export function iconesDeclarees(html: string, base: string): string[] {
  const liens = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0])
  const attr = (balise: string, nom: string) =>
    balise.match(new RegExp(`\\b${nom}\\s*=\\s*["']([^"']+)["']`, 'i'))?.[1]
  const candidats: { url: string; score: number }[] = []
  for (const balise of liens) {
    const rel = attr(balise, 'rel')?.toLowerCase() ?? ''
    const href = attr(balise, 'href')
    if (!href || !/\bicon\b|apple-touch-icon/.test(rel)) continue
    const taille = Math.max(0, ...(attr(balise, 'sizes') ?? '').split(/\s+/).map((s) => parseInt(s, 10) || 0))
    const type = attr(balise, 'type') ?? ''
    let score = taille
    if (rel.includes('apple-touch-icon')) score += 1000 // carrée, pleine, pensée pour un écran d'accueil
    if (/svg/.test(type) || /\.svg(\?|$)/i.test(href)) score += 500
    if (/\.ico(\?|$)/i.test(href)) score -= 200
    try {
      candidats.push({ url: new URL(href, base).href, score })
    } catch {
      // href invalide : on l'ignore
    }
  }
  return [...new Set(candidats.sort((a, b) => b.score - a.score).map((c) => c.url))]
}
