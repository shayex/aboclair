/**
 * Pages statiques « Comment résilier X », générées au moment du build (scripts/generer-pages.ts).
 * Du HTML simple, lisible sans JavaScript, pour les moteurs de recherche.
 */
import { CATEGORIES, marques, prixCatalogueCentimes, type Marque } from '../lib/catalogue'
import { CONSEIL_PREUVE, DROITS } from '../lib/droits'
import { formaterEuros } from '../lib/format'
import { infosFrequence } from '../lib/libelles'
import { logoPour } from '../lib/logos'
import type { Categorie } from '../types'
import { URL_ABONNEMENTS_APPLE, URL_ABONNEMENTS_GOOGLE_PLAY, URL_SIGNALCONSO } from '../lib/resiliation'

export interface Contexte {
  /** Adresse publique du site, avec la barre finale : https://exemple.github.io/aboclair/ */
  site: string
  /** Balise de mesure d'audience à insérer dans <head>, ou chaîne vide. */
  audience: string
}

export const ANNEE = 2026

/** Catégories qu'on peut payer dans une appli (App Store, Google Play). */
const VENDU_EN_APPLI: Categorie[] = ['video', 'musique', 'ia', 'presse', 'jeux', 'cloud']

export function echapper(texte: string): string {
  return texte
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function cheminMarque(m: Marque): string {
  return `resilier/${m.slug}/`
}

function gabarit(ctx: Contexte, o: { titre: string; description: string; chemin: string; corps: string; profondeur: number }) {
  const racine = '../'.repeat(o.profondeur)
  const url = ctx.site + o.chemin
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="color-scheme" content="light dark" />
<title>${echapper(o.titre)}</title>
<meta name="description" content="${echapper(o.description)}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="AboClair" />
<meta property="og:locale" content="fr_FR" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${echapper(o.titre)}" />
<meta property="og:description" content="${echapper(o.description)}" />
<meta property="og:image" content="${ctx.site}og.jpg" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="${racine}favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="${racine}apple-touch-icon.png" />
<link rel="stylesheet" href="${racine}resilier/style.css" />
${ctx.audience}
</head>
<body>
<header class="haut"><a class="logo" href="${racine}"><span aria-hidden="true">✓</span>AboClair</a></header>
<main>
${o.corps}
</main>
<footer class="bas">
<p>Information, pas conseil juridique. Prix indicatifs (octobre ${ANNEE}), à vérifier sur ton relevé.</p>
<p>AboClair n’est lié à aucun des services cités. Les noms et logos appartiennent à leurs propriétaires et servent seulement à identifier les services (icônes : Simple Icons).</p>
</footer>
</body>
</html>
`
}

function appel(racine: string) {
  return `<aside class="appel">
<h2>Combien te coûtent tous tes abonnements ?</h2>
<p>Fais ton bilan en 60 secondes : le total par an, ce que tu peux couper, et comment résilier. Gratuit, sans compte, sans banque.</p>
<a class="bouton" href="${racine}">Faire mon bilan</a>
</aside>`
}

/** Logo de la marque (ou pastille d'initiales) en HTML statique. */
export function logoHtml(nom: string): string {
  const logo = logoPour(nom)
  if (logo.type === 'icone') {
    return `<span class="logo-marque" style="background:${logo.fond}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="${logo.glyphe}"><path d="${logo.chemin}"/></svg></span>`
  }
  if (logo.type === 'image') {
    return `<span class="logo-marque image" aria-hidden="true"><img src="../../${logo.fichier}" alt="" /></span>`
  }
  return `<span class="logo-marque initiales" style="--teinte:${logo.teinte}" aria-hidden="true">${echapper(logo.lettres)}</span>`
}

/** « 4 offres, de 6,07 € par mois à 21,24 € par mois », de la moins chère à la plus chère sur un an. */
export function plageDePrix(m: Marque): string {
  const parCoutAnnuel = [...m.offres].sort(
    (a, b) => prixCatalogueCentimes(a, 'annuel') - prixCatalogueCentimes(b, 'annuel'),
  )
  const prix = parCoutAnnuel.map((o) => `${formaterEuros(prixCatalogueCentimes(o))} ${infosFrequence(o.frequence).libelle}`)
  return m.offres.length === 1 ? prix[0] : `${m.offres.length} offres, de ${prix[0]} à ${prix[prix.length - 1]}`
}

export function pageMarque(m: Marque, ctx: Contexte): string {
  const o0 = m.offres[0]
  const racine = '../../'
  const offres = m.offres
    .map(
      (o) =>
        `<tr><td>${echapper(o.offre ?? o.nom)}</td><td>${formaterEuros(prixCatalogueCentimes(o))} ${infosFrequence(o.frequence).libelle}</td></tr>`,
    )
    .join('\n')
  const corps = `<nav class="fil" aria-label="Fil d’Ariane"><a href="${racine}">AboClair</a> › <a href="../">Résilier un abonnement</a> › ${echapper(m.nom)}</nav>
<div class="titre">${logoHtml(m.nom)}<h1>Comment résilier ${echapper(m.nom)}</h1></div>
<p class="intro">Le lien direct, le chemin à suivre et tes droits. ${echapper(m.nom)} : ${echapper(plageDePrix(m))}.</p>

<section>
<h2>Les étapes</h2>
<ol class="etapes">
<li><strong>Va sur la bonne page.</strong><br /><a class="bouton" href="${echapper(o0.urlResiliation)}" rel="noopener nofollow">Ouvrir la page de résiliation ${echapper(m.nom)}</a></li>
<li><strong>Suis le chemin.</strong><br />${echapper(o0.noteResiliation)}</li>
<li><strong>Garde une preuve.</strong><br />${echapper(CONSEIL_PREUVE)}</li>
</ol>
</section>

${VENDU_EN_APPLI.includes(m.categorie) ? `<section>
<h2>Tu paies via l’App Store ou Google Play ?</h2>
<p>Dans ce cas, la résiliation se fait chez Apple ou Google, pas sur le site de ${echapper(m.nom)}. Désinstaller l’application n’arrête pas l’abonnement.</p>
<ul>
<li><strong>iPhone :</strong> Réglages → ton nom → Abonnements → ${echapper(m.nom)} → Annuler (<a href="${URL_ABONNEMENTS_APPLE}" rel="noopener nofollow">ouvrir mes abonnements Apple</a>).</li>
<li><strong>Android :</strong> Play Store → ton profil → Paiements et abonnements → Abonnements (<a href="${URL_ABONNEMENTS_GOOGLE_PLAY}" rel="noopener nofollow">ouvrir mes abonnements Google Play</a>).</li>
</ul>
</section>` : ''}

<section>
<h2>Les offres ${echapper(m.nom)} et leurs prix</h2>
<table><thead><tr><th>Offre</th><th>Prix indicatif</th></tr></thead><tbody>
${offres}
</tbody></table>
<p class="note">Prix indicatifs (octobre ${ANNEE}) : vérifie le montant exact sur ton relevé.</p>
</section>

<section>
<h2>Tes droits</h2>
<ul>
${DROITS.map((d) => `<li><strong>${echapper(d.titre)}</strong> ${echapper(d.texte)}</li>`).join('\n')}
</ul>
<p>${echapper(m.nom)} bloque ta résiliation ? <a href="${URL_SIGNALCONSO}" rel="noopener">Signale-le sur SignalConso</a>, le site officiel de la DGCCRF.</p>
</section>

${appel(racine)}`
  return gabarit(ctx, {
    titre: `Comment résilier ${m.nom} en ${ANNEE} · AboClair`,
    description: `Résilier ${m.nom} : le lien direct, le chemin à suivre, et tes droits (résiliation en 3 clics, loi Chatel). ${plageDePrix(m)}.`,
    chemin: cheminMarque(m),
    corps,
    profondeur: 2,
  })
}

export function pageIndex(ctx: Contexte): string {
  const sections = CATEGORIES.map((c) => {
    const liens = marques
      .filter((m) => m.categorie === c.id)
      .map((m) => `<li><a href="${m.slug}/">Résilier ${echapper(m.nom)}</a></li>`)
      .join('\n')
    return `<section><h2>${echapper(c.libelle)}</h2><ul class="liste">\n${liens}\n</ul></section>`
  }).join('\n')
  const corps = `<nav class="fil" aria-label="Fil d’Ariane"><a href="../">AboClair</a> › Résilier un abonnement</nav>
<h1>Comment résilier un abonnement</h1>
<p class="intro">${marques.length} guides pas à pas : le lien direct, le chemin à suivre et tes droits pour chaque service.</p>
${sections}
${appel('../')}`
  return gabarit(ctx, {
    titre: `Comment résilier un abonnement : ${marques.length} guides · AboClair`,
    description: `Guides pour résilier Netflix, Basic-Fit, Canal+, Spotify, SFR et ${marques.length - 5} autres services : lien direct, étapes et droits.`,
    chemin: 'resilier/',
    corps,
    profondeur: 1,
  })
}

export function planDuSite(ctx: Contexte, date: string): string {
  const urls = ['', 'resilier/', ...marques.map(cheminMarque)]
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>${ctx.site}${u}</loc><lastmod>${date}</lastmod></url>`).join('\n')}
</urlset>
`
}

export const STYLE = `:root{--fond:#f4f4f1;--surface:#fff;--texte:#15171c;--texte-2:#5a5f6a;--bord:rgb(21 23 28/.09);--accent:#2348d8;--accent-texte:#fff;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--fond:#0c0d10;--surface:#17191e;--texte:#f2f3f5;--texte-2:#a3a8b3;--bord:rgb(255 255 255/.09);--accent:#87a0ff;--accent-texte:#0c0d10;color-scheme:dark}}
*{box-sizing:border-box}
body{margin:0;background:var(--fond);color:var(--texte);font:100%/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-text-size-adjust:100%;-webkit-font-smoothing:antialiased}
.haut,main,.bas{max-width:40rem;margin:0 auto;padding:0 1rem}
.haut{padding-top:max(1.25rem,env(safe-area-inset-top))}
.logo{display:inline-flex;align-items:center;gap:.5rem;font-weight:600;color:inherit;text-decoration:none}
.logo span{display:grid;place-items:center;width:1.75rem;height:1.75rem;border-radius:.5rem;background:var(--accent);color:var(--accent-texte);font-size:.9rem}
.fil{margin-top:2rem;font-size:.875rem;color:var(--texte-2)}
.fil a{color:inherit}
h1{font-size:clamp(2rem,7vw,2.75rem);line-height:1.08;letter-spacing:-.03em;margin:.75rem 0 0}
h2{font-size:1.3rem;letter-spacing:-.015em;line-height:1.25;margin:2.5rem 0 .75rem}
.intro{font-size:1.0625rem;color:var(--texte-2);margin-top:.75rem}
a{color:var(--accent)}
.etapes{padding-left:1.25rem}
.etapes li{margin-bottom:1rem}
.bouton{display:inline-block;margin-top:.5rem;padding:.75rem 1.1rem;border-radius:1rem;background:var(--accent);color:var(--accent-texte);font-weight:600;text-decoration:none}
table{width:100%;border-collapse:collapse;background:var(--surface);border:1px solid var(--bord);border-radius:1rem;overflow:hidden}
th,td{text-align:left;padding:.65rem .9rem;border-bottom:1px solid var(--bord)}
th{font-size:.8125rem;color:var(--texte-2);font-weight:600}
tr:last-child td{border-bottom:0}
.note{font-size:.875rem;color:var(--texte-2)}
.liste{columns:2;column-gap:1.5rem;padding-left:1.1rem}
.liste li{break-inside:avoid;margin-bottom:.35rem}
.appel{margin:3rem 0 0;padding:1.5rem;border-radius:1.5rem;background:var(--surface);border:1px solid var(--bord)}
.appel h2{margin-top:0}
.appel p{color:var(--texte-2)}
.bas{margin-top:3rem;padding-bottom:3rem;font-size:.8125rem;color:var(--texte-2);border-top:1px solid var(--bord);padding-top:1.5rem}
@media (max-width:30rem){.liste{columns:1}}
.titre{display:flex;align-items:center;gap:.9rem;margin-top:.75rem}
.titre h1{margin:0}
.logo-marque{flex:none;display:grid;place-items:center;width:3.25rem;height:3.25rem;border-radius:.9rem;box-shadow:inset 0 0 0 1px rgb(0 0 0/.06)}
.logo-marque svg{width:1.8rem;height:1.8rem}
.logo-marque.image{background:#fff;overflow:hidden}
.logo-marque.image img{width:100%;height:100%;object-fit:contain}
.initiales{font-weight:700;font-size:1.2rem;background:hsl(var(--teinte) 60% 92%);color:hsl(var(--teinte) 55% 30%)}
@media (prefers-color-scheme:dark){.initiales{background:hsl(var(--teinte) 30% 24%);color:hsl(var(--teinte) 70% 82%)}.logo-marque{box-shadow:inset 0 0 0 1px rgb(255 255 255/.1)}}
`
