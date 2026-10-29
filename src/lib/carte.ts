import { formaterEuros } from './format'

export const LARGEUR_CARTE = 1080
export const HAUTEUR_CARTE = 1350

export interface TexteCarte {
  avant: string
  montant: string
  apres: string
  partage: string
}

/** Le texte de la carte : les économies réalisées si l'utilisateur en a, sinon le potentiel. */
export function texteCarte(economieTotale: number, economieFaite: number, url: string): TexteCarte {
  const faite = economieFaite > 0
  const montant = formaterEuros(faite ? economieFaite : economieTotale, true)
  return {
    avant: faite ? 'J’ai économisé' : 'J’ai trouvé',
    montant,
    apres: faite ? 'par an sur mes abonnements' : 'd’économies par an',
    partage: `${faite ? 'J’ai économisé' : 'J’ai trouvé'} ${montant} ${
      faite ? 'par an sur mes abonnements' : 'd’économies par an sur mes abonnements'
    } avec AboClair. Fais ton bilan en 60 secondes, sans compte : ${url}`,
  }
}

const POLICE = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif'

/** Réduit la taille de police jusqu'à ce que le texte tienne dans la largeur. */
function ajuster(ctx: CanvasRenderingContext2D, texte: string, graisse: number, taille: number, largeurMax: number) {
  let t = taille
  do {
    ctx.font = `${graisse} ${t}px ${POLICE}`
    t -= 4
  } while (ctx.measureText(texte).width > largeurMax && t > 20)
}

export function dessinerCarte(ctx: CanvasRenderingContext2D, texte: TexteCarte, adresse: string) {
  const L = LARGEUR_CARTE
  const H = HAUTEUR_CARTE
  const marge = 96

  const fond = ctx.createLinearGradient(0, 0, L, H)
  fond.addColorStop(0, '#2d55ea')
  fond.addColorStop(1, '#16309f')
  ctx.fillStyle = fond
  ctx.fillRect(0, 0, L, H)

  // Halo discret en haut à droite.
  const halo = ctx.createRadialGradient(L * 0.85, H * 0.1, 0, L * 0.85, H * 0.1, L * 0.7)
  halo.addColorStop(0, 'rgba(255,255,255,0.18)')
  halo.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = halo
  ctx.fillRect(0, 0, L, H)

  // Logo : carré blanc avec une coche.
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(marge, marge, 72, 72, 18)
  ctx.fill()
  ctx.strokeStyle = '#2348d8'
  ctx.lineWidth = 9
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(marge + 19, marge + 38)
  ctx.lineTo(marge + 31, marge + 50)
  ctx.lineTo(marge + 54, marge + 24)
  ctx.stroke()
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 44px ${POLICE}`
  ctx.textBaseline = 'middle'
  ctx.fillText('AboClair', marge + 96, marge + 38)

  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = `600 64px ${POLICE}`
  ctx.fillText(texte.avant, marge, 560)

  ctx.fillStyle = '#ffffff'
  ajuster(ctx, texte.montant, 800, 260, L - marge * 2)
  ctx.fillText(texte.montant, marge - 8, 800)

  ctx.font = `600 64px ${POLICE}`
  ajuster(ctx, texte.apres, 600, 64, L - marge * 2)
  ctx.fillText(texte.apres, marge, 900)

  // Pied : invitation et adresse.
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fillRect(marge, H - 250, L - marge * 2, 2)
  ctx.fillStyle = '#ffffff'
  ctx.font = `600 44px ${POLICE}`
  ctx.fillText('Fais ton bilan en 60 secondes', marge, H - 160)
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = `500 38px ${POLICE}`
  ctx.fillText(`${adresse} · sans compte, sans banque`, marge, H - 100)
}

export function genererCarte(texte: TexteCarte, adresse: string): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = LARGEUR_CARTE
  canvas.height = HAUTEUR_CARTE
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('Canvas indisponible'))
  dessinerCarte(ctx, texte, adresse)
  return new Promise((resoudre, rejeter) =>
    canvas.toBlob((b) => (b ? resoudre(b) : rejeter(new Error('Image non générée'))), 'image/png'),
  )
}
