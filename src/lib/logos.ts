/**
 * Logos des marques, tirés de Simple Icons (CC0) et intégrés au site : aucun appel à un serveur
 * externe. Ils servent seulement à identifier le service. Les marques absentes de la bibliothèque
 * (souvent parce qu'elles ont demandé le retrait de leur logo) ont une pastille avec leurs initiales.
 */
import {
  siAppletv,
  siApplearcade,
  siApplemusic,
  siAudible,
  siClaude,
  siCrunchyroll,
  siDeezer,
  siDropbox,
  siGoogle,
  siGooglegemini,
  siHbomax,
  siIcloud,
  siLequipe,
  siMistralai,
  siNetflix,
  siOrange,
  siParamountplus,
  siPerplexity,
  siPlaystation,
  siSpotify,
  siStrava,
  siUbisoft,
  siYoutube,
  siYoutubemusic,
  type SimpleIcon,
} from 'simple-icons'
import imagesRecuperees from '../data/logos.json'

export const ICONES: Record<string, SimpleIcon> = {
  Netflix: siNetflix,
  'HBO Max': siHbomax,
  'Apple TV': siAppletv,
  'Paramount+': siParamountplus,
  Crunchyroll: siCrunchyroll,
  'YouTube Premium': siYoutube,
  Spotify: siSpotify,
  Deezer: siDeezer,
  'Apple Music': siApplemusic,
  'YouTube Music': siYoutubemusic,
  Audible: siAudible,
  Claude: siClaude,
  'Google AI Pro (Gemini)': siGooglegemini,
  'Le Chat (Mistral)': siMistralai,
  Perplexity: siPerplexity,
  Strava: siStrava,
  'L’Équipe': siLequipe,
  'PlayStation Plus': siPlaystation,
  'Apple Arcade': siApplearcade,
  'Ubisoft+': siUbisoft,
  'iCloud+': siIcloud,
  'Google One': siGoogle,
  Dropbox: siDropbox,
  'Box Orange (Livebox)': siOrange,
}

/** Logos récupérés sur les sites des marques (workflow « Récupérer les logos »), servis par le site. */
const IMAGES = imagesRecuperees as Record<string, { fichier: string; source: string }>

export type Logo =
  | { type: 'icone'; chemin: string; fond: string; glyphe: string }
  | { type: 'image'; fichier: string; lettres: string; teinte: number }
  | { type: 'initiales'; lettres: string; teinte: number }

/** Luminance relative (WCAG) d'une couleur hexadécimale « RRGGBB ». */
export function luminance(hex: string): number {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const MOTS_IGNORES = new Set(['box', 'forfait', 'le', 'la', 'les', 'l', 'd', 'by', 'de', 'du'])

/** « Basic-Fit » → « BF », « Canal+ » → « C+ », « Box SFR » → « S », « Forfait RED by SFR » → « RS ». */
export function initiales(nom: string): string {
  const propre = nom.replace(/\(.*?\)/g, '').replace(/[’']/g, ' ').trim()
  const plus = propre.endsWith('+')
  const mots = propre
    .replace(/\+/g, '')
    .split(/[\s\-&]+/)
    .filter((m) => m && !MOTS_IGNORES.has(m.toLowerCase()))
  const lettres = mots.length === 0 ? '?' : mots.length === 1 ? mots[0][0] : mots[0][0] + mots[1][0]
  return (plus ? lettres[0] + '+' : lettres).toUpperCase()
}

/** Teinte stable pour un nom, pour que deux pastilles voisines se distinguent. */
function teinte(nom: string): number {
  let h = 0
  for (const c of nom) h = (h * 31 + c.charCodeAt(0)) % 360
  return h
}

export function logoPour(nom: string): Logo {
  const icone = ICONES[nom]
  if (icone) {
    return {
      type: 'icone',
      chemin: icone.path,
      fond: `#${icone.hex}`,
      // Glyphe noir sur les couleurs claires (vert Spotify, orange Audible…), blanc sinon.
      glyphe: luminance(icone.hex) > 0.4 ? '#000000' : '#ffffff',
    }
  }
  const image = IMAGES[nom]
  if (image) return { type: 'image', fichier: image.fichier, lettres: initiales(nom), teinte: teinte(nom) }
  return { type: 'initiales', lettres: initiales(nom), teinte: teinte(nom) }
}
