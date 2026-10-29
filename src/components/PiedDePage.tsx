export function PiedDePage() {
  return (
    <footer className="mt-16 border-t border-bord pt-6 text-[0.8125rem] leading-relaxed text-texte-2">
      <p>
        <strong className="font-semibold text-texte">AboClair</strong> · Mets tes abonnements au clair.
      </p>
      <ul className="mt-2 flex flex-col gap-1">
        <li>Prix indicatifs (octobre 2026), à vérifier sur tes relevés.</li>
        <li>Information, pas conseil juridique.</li>
        <li>Aucun compte, aucun cookie : tes données restent dans ton navigateur.</li>
        <li>AboClair n’est lié à aucun des services cités. Les noms appartiennent à leurs propriétaires.</li>
        <li>
          <a href={`${import.meta.env.BASE_URL}resilier/`} className="font-medium text-accent underline underline-offset-2">
            Guides de résiliation par service
          </a>
        </li>
      </ul>
    </footer>
  )
}
