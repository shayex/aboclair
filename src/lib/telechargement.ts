/** Propose un fichier au téléchargement, entièrement dans le navigateur. */
export function telecharger(nomFichier: string, contenu: string, type: string): void {
  const url = URL.createObjectURL(new Blob([contenu], { type }))
  const lien = document.createElement('a')
  lien.href = url
  lien.download = nomFichier
  document.body.append(lien)
  lien.click()
  lien.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
