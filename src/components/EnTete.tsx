import { IconeBouclier } from './ui/Icones'

export function EnTete() {
  return (
    <header className="pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-2 text-[0.9375rem] font-semibold tracking-[-0.01em]">
        <span className="grid size-7 place-items-center rounded-lg bg-accent text-accent-texte" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        AboClair
      </div>
      <h1 className="mt-8 text-[2.5rem] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
        Mets tes abonnements au clair.
      </h1>
      <p className="mt-3 max-w-[34ch] text-[1.0625rem] leading-relaxed text-texte-2">
        Ton bilan en 60 secondes : combien tu paies vraiment, et ce que tu peux couper.
      </p>
      <p className="mt-4 flex items-start gap-2 text-sm text-texte-2">
        <IconeBouclier className="mt-0.5 shrink-0 text-base text-garder" />
        <span>
          Sans compte. Sans banque. Tes abonnements restent dans ce navigateur, rien n’est envoyé.
        </span>
      </p>
    </header>
  )
}
