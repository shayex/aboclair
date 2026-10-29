/**
 * Marques sans icône Simple Icons dont le logo récupéré a été écarté à la relecture :
 * elles gardent leurs initiales.
 */
export const EXCLUES: Record<string, string> = {
  'EA Play': 'icône du site trop petite : pixelisée une fois agrandie',
  'Kindle Unlimited': 'le site donne le logo Amazon, pas celui de Kindle',
}

/** Site officiel de chaque marque sans icône Simple Icons, d'où récupérer son logo. */
export const SITES: Record<string, string> = {
  'Amazon Prime': 'https://www.amazon.fr/',
  'Disney+': 'https://www.disneyplus.com/',
  'Canal+': 'https://www.canalplus.com/',
  'Amazon Music Unlimited': 'https://music.amazon.fr/',
  Qobuz: 'https://www.qobuz.com/',
  ChatGPT: 'https://chatgpt.com/',
  'Basic-Fit': 'https://www.basic-fit.com/',
  'Fitness Park': 'https://www.fitnesspark.fr/',
  'beIN SPORTS': 'https://www.beinsports.com/',
  'Ligue 1+': 'https://www.ligue1plus.fr/',
  'Le Monde': 'https://www.lemonde.fr/',
  'Le Figaro': 'https://www.lefigaro.fr/',
  Libération: 'https://www.liberation.fr/',
  Mediapart: 'https://www.mediapart.fr/',
  Cafeyn: 'https://www.cafeyn.co/',
  'Xbox Game Pass': 'https://www.xbox.com/',
  'Nintendo Switch Online': 'https://www.nintendo.com/',
  'Microsoft 365': 'https://www.microsoft365.com/',
  'Box Free': 'https://www.free.fr/',
  'Box SFR': 'https://www.sfr.fr/',
  'Box Bouygues Telecom (Bbox)': 'https://www.bouyguestelecom.fr/',
  'Forfait Free': 'https://mobile.free.fr/',
  'Forfait Sosh': 'https://www.sosh.fr/',
  'Forfait RED by SFR': 'https://www.red-by-sfr.fr/',
  'Forfait B&You': 'https://www.bouyguestelecom.fr/',
}
