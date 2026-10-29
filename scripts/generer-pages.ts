/** Après `vite build` : écrit les pages « Comment résilier X », leur index et le plan du site dans dist/. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { marques } from '../src/lib/catalogue'
import { cheminMarque, pageIndex, pageMarque, planDuSite, STYLE, type Contexte } from '../src/seo/pages'
import { baliseAudience } from '../src/lib/audience'

const DIST = 'dist'

function lireEnv(nom: string): string | undefined {
  if (process.env[nom]) return process.env[nom]
  try {
    const ligne = readFileSync('.env', 'utf8')
      .split('\n')
      .find((l) => l.startsWith(`${nom}=`))
    return ligne?.slice(nom.length + 1).trim()
  } catch {
    return undefined
  }
}

const site = lireEnv('VITE_SITE_URL')
if (!site?.endsWith('/')) throw new Error('VITE_SITE_URL doit être défini et finir par « / » (voir .env)')

const ctx: Contexte = { site, audience: baliseAudience(lireEnv('VITE_UMAMI_WEBSITE_ID'), site) }

function ecrire(chemin: string, contenu: string) {
  const complet = join(DIST, chemin)
  mkdirSync(dirname(complet), { recursive: true })
  writeFileSync(complet, contenu)
}

ecrire('resilier/style.css', STYLE)
ecrire('resilier/index.html', pageIndex(ctx))
for (const m of marques) ecrire(`${cheminMarque(m)}index.html`, pageMarque(m, ctx))
ecrire('sitemap.xml', planDuSite(ctx, new Date().toISOString().slice(0, 10)))

console.log(`Pages de résiliation : ${marques.length} pages + index + sitemap.xml`)
