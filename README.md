# AboClair

> Mets tes abonnements au clair.

Site web gratuit, en français, sans compte et sans connexion bancaire : en moins d’une minute, il montre
combien tes abonnements coûtent par mois, par an et sur 10 ans, t’aide à décider lesquels garder,
mettre en pause, couper ou partager, et t’explique comment résilier.

Toutes les données restent dans le navigateur (`localStorage`), avec export et import en JSON.

## Développer

```bash
npm install
npm run dev        # site local sur http://localhost:5173/aboclair/
npm test           # tests des calculs, du verdict, des rappels .ics et de l’import
npm run build      # vérification des types + build dans dist/
```

## Organisation

| Dossier | Contenu |
| --- | --- |
| `src/data/catalogue.json` | Les offres : marque, offre, catégorie, prix indicatif par prélèvement, fréquence, lien et chemin de résiliation |
| `src/lib/` | Logique pure, testée : calculs, verdict, rappels `.ics`, stockage, résiliation, comparaison à la moyenne, carte de partage |
| `src/seo/` + `scripts/generer-pages.ts` | Pages statiques « Comment résilier X » et `sitemap.xml`, générées après `vite build` |
| `src/state/` | État des abonnements et sauvegarde automatique |
| `src/components/` | Interface (mobile d’abord, mode clair et sombre) |

## Mettre à jour un prix ou ajouter une offre

Dans `src/data/catalogue.json`, chaque offre a une `marque` (« Basic-Fit »), un nom d’`offre`
facultatif (« Comfort »), un `prixIndicatif` en euros **par prélèvement** et une `frequence`
(`mensuel`, `4-semaines` ou `annuel`). Les offres d’une même marque sont regroupées dans une seule
case du catalogue, et `populaire: true` la place dans « Les plus courants ». Mets à jour
`dateMiseAJourPrix` (`AAAA-MM-JJ`), puis lance `npm test` : un test vérifie que chaque offre est complète.
Ne change pas l’`id` d’une offre existante : les données des visiteurs y font référence.

Les prix et liens de résiliation ont été rédigés sans vérification sur les sites des services :
vérifie au moins les plus courants avant de partager le site.

## Logos des marques

Les logos viennent de [Simple Icons](https://simpleicons.org) (licence CC0), intégrés au site
(aucun appel à un serveur externe), et servent seulement à identifier les services. La liste est dans
`src/lib/logos.ts`.

Pour les marques absentes de Simple Icons (Amazon, Disney+, Canal+, ChatGPT, Basic-Fit, opérateurs…),
le workflow manuel **« Récupérer les logos »** (onglet Actions) télécharge l’icône officielle sur le site
de chaque marque (`scripts/sites-des-marques.ts`) et la pousse sur la branche `logos-automatiques`.
Après relecture, les bonnes images vont dans `public/logos/` et sont listées dans `src/data/logos.json`.
Les logos écartés à la relecture sont listés dans `EXCLUES` ; ces marques gardent leurs initiales.

Si une marque demande le retrait de son logo : retire sa ligne dans `ICONES` ou dans
`src/data/logos.json` (et son fichier), puis ajoute-la à `EXCLUES`.

## Mesure d’audience (facultatif)

Le site peut compter ses visites avec [Umami](https://umami.is), sans cookie ni donnée personnelle.
Les événements n’envoient qu’un nom d’étape (`bilan-vu`, `resiliation-ouverte`…), jamais un montant
ni un nom d’abonnement.

1. Crée un compte sur Umami Cloud (offre gratuite) et ajoute le site `shayex.github.io`.
2. Copie son identifiant (« Website ID »).
3. Sur GitHub : *Settings → Secrets and variables → Actions → Variables → New repository variable*,
   nom `UMAMI_WEBSITE_ID`, valeur l’identifiant.
4. Relance le déploiement. Sans cette variable, aucun script n’est chargé.

Indicateur clé : la part des visites qui atteignent `bilan-vu`.

## Référencement

Les guides sont publiés sur `/aboclair/resilier/`. Pour les faire connaître de Google, ajoute le
site dans [Google Search Console](https://search.google.com/search-console) et déclare
`https://shayex.github.io/aboclair/sitemap.xml`.

## Déploiement

Chaque push sur `main` lance les tests, le build et la publication sur GitHub Pages
(`.github/workflows/deploy.yml`). Une seule fois : dans les réglages du dépôt, *Settings → Pages →
Source*, choisis **GitHub Actions**.
