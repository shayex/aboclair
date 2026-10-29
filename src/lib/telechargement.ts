/** Propose un fichier au téléchargement, entièrement dans le navigateur. */
export function telecharger(nomFichier: string, contenu: string | Blob, type?: string): void {
  const blob = typeof contenu === 'string' ? new Blob([contenu], { type }) : contenu
  const url = URL.createObjectURL(blob)
  const lien = document.createElement('a')
  lien.href = url
  lien.download = nomFichier
  document.body.append(lien)
  lien.click()
  lien.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
