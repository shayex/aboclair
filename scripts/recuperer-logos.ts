/**
 * Récupère, sur le site officiel de chaque marque sans icône Simple Icons, son icône (de préférence
 * celle d'écran d'accueil iOS), et l'enregistre dans public/logos/. Le site sert ensuite ces fichiers
 * lui-même : aucun appel à un serveur tiers pendant la visite.
 * Lancé par le workflow « Récupérer les logos » (GitHub Actions a accès à Internet).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { marques } from '../src/lib/catalogue'
import { iconesDeclarees } from './icones-html'
import { SITES } from './sites-des-marques'

const NAVIGATEUR =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
const TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

async function telecharger(url: string) {
  const r = await fetch(url, { headers: { 'user-agent': NAVIGATEUR }, redirect: 'follow', signal: AbortSignal.timeout(15000) })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return r
}

async function essayer(url: string) {
  try {
    const r = await telecharger(url)
    const type = (r.headers.get('content-type') ?? '').split(';')[0].trim()
    const extension = TYPES[type]
    const octets = Buffer.from(await r.arrayBuffer())
    if (!extension || octets.length < 300) return null
    return { extension, octets, source: r.url }
  } catch {
    return null
  }
}

const manifeste: Record<string, { fichier: string; source: string }> = {}
mkdirSync('public/logos', { recursive: true })

for (const [nom, site] of Object.entries(SITES)) {
  const marque = marques.find((m) => m.nom === nom)
  if (!marque) {
    console.log(`?  ${nom} : absente du catalogue`)
    continue
  }
  const candidats: string[] = []
  try {
    const page = await telecharger(site)
    candidats.push(...iconesDeclarees(await page.text(), page.url))
  } catch (e) {
    console.log(`…  ${nom} : page inaccessible (${(e as Error).message})`)
  }
  const origine = new URL(site).origin
  candidats.push(`${origine}/apple-touch-icon.png`, `https://www.google.com/s2/favicons?domain=${new URL(site).hostname}&sz=128`)

  let trouve = null
  for (const url of candidats) if ((trouve = await essayer(url))) break
  if (!trouve) {
    console.log(`✗  ${nom} : aucune icône utilisable`)
    continue
  }
  const fichier = `logos/${marque.slug}.${trouve.extension}`
  writeFileSync(`public/${fichier}`, trouve.octets)
  manifeste[nom] = { fichier, source: trouve.source }
  console.log(`✓  ${nom} : ${fichier} (${trouve.octets.length} octets) ← ${trouve.source}`)
}

writeFileSync('src/data/logos.json', JSON.stringify(manifeste, null, 2) + '\n')
console.log(`${Object.keys(manifeste).length} logos sur ${Object.keys(SITES).length}`)
