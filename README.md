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
| `src/data/catalogue.json` | Les ~55 services : nom, catégorie, prix indicatif daté, lien et chemin de résiliation |
| `src/lib/` | Logique pure, testée : calculs, verdict, rappels `.ics`, stockage, résiliation |
| `src/state/` | État des abonnements et sauvegarde automatique |
| `src/components/` | Interface (mobile d’abord, mode clair et sombre) |

## Mettre à jour un prix

Modifie le service dans `src/data/catalogue.json` (prix en euros, `dateMiseAJourPrix` au format
`AAAA-MM-JJ`), puis lance `npm test` : un test vérifie que chaque service est complet.

Les prix et liens de résiliation ont été rédigés sans vérification sur les sites des services :
vérifie au moins les plus courants avant de partager le site.

## Déploiement

Chaque push sur `main` lance les tests, le build et la publication sur GitHub Pages
(`.github/workflows/deploy.yml`). Une seule fois : dans les réglages du dépôt, *Settings → Pages →
Source*, choisis **GitHub Actions**.
