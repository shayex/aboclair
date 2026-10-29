import { useState, type CSSProperties, type ReactNode } from 'react'
import { trouverService } from '../../lib/catalogue'
import { logoPour } from '../../lib/logos'

/** Logo de la marque, ou pastille avec ses initiales. Décoratif : le nom est toujours écrit à côté. */
export function LogoMarque({ nom, taille = 32 }: { nom: string; taille?: number }) {
  const logo = logoPour(nom)
  const style: CSSProperties = { width: taille, height: taille, borderRadius: Math.round(taille * 0.27) }

  if (logo.type === 'icone') {
    return (
      <span
        aria-hidden="true"
        className="grid shrink-0 place-items-center ring-1 ring-black/5 dark:ring-white/10"
        style={{ ...style, background: logo.fond }}
      >
        <svg viewBox="0 0 24 24" width={Math.round(taille * 0.56)} height={Math.round(taille * 0.56)} fill={logo.glyphe}>
          <path d={logo.chemin} />
        </svg>
      </span>
    )
  }

  if (logo.type === 'image') {
    return <ImageLogo fichier={logo.fichier} style={style} repli={<Initiales lettres={logo.lettres} teinte={logo.teinte} style={style} taille={taille} />} />
  }

  return <Initiales lettres={logo.lettres} teinte={logo.teinte} style={style} taille={taille} />
}

/** Image servie par le site ; si elle ne charge pas, on affiche les initiales. */
function ImageLogo({ fichier, style, repli }: { fichier: string; style: CSSProperties; repli: ReactNode }) {
  const [erreur, setErreur] = useState(false)
  if (erreur) return repli
  return (
    <span aria-hidden="true" className="grid shrink-0 place-items-center overflow-hidden bg-white ring-1 ring-black/5 dark:ring-white/10" style={style}>
      <img
        src={`${import.meta.env.BASE_URL}${fichier}`}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setErreur(true)}
        className="size-full object-contain"
      />
    </span>
  )
}

function Initiales({ lettres, teinte, style, taille }: { lettres: string; teinte: number; style: CSSProperties; taille: number }) {
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center bg-[hsl(var(--teinte)_60%_92%)] font-semibold tracking-[-0.02em] text-[hsl(var(--teinte)_55%_30%)] dark:bg-[hsl(var(--teinte)_30%_24%)] dark:text-[hsl(var(--teinte)_70%_82%)]"
      style={{ ...style, fontSize: Math.round(taille * (lettres.length > 1 ? 0.38 : 0.46)), ['--teinte' as string]: teinte }}
    >
      {lettres}
    </span>
  )
}

/** La marque d'un abonnement du catalogue, ou son nom s'il est personnalisé. */
export function nomDeMarque(a: { serviceId: string | null; nom: string }): string {
  return trouverService(a.serviceId)?.marque ?? a.nom
}
