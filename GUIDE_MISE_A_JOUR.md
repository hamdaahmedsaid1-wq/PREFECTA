# PREFECTA — mise à jour « Fiche de dossier et historique »

Cette archive contient **uniquement les fichiers modifiés** par rapport à `PREFECTA_COMME_AL_SHIFA_FullStack`, plus la nouvelle page `dossier-detail.html`. Elle ne contient ni `.env`, ni sauvegarde de base, ni fichiers `node_modules`.

## Installation Windows

1. Avant toute modification : exporter `prefecta_ali_sabieh` depuis phpMyAdmin et **faire une copie du dossier complet du projet**.
2. Fermer les serveurs Node/Vite (Ctrl+C dans leurs terminaux).
3. Extraire cette archive **dans** `C:\wamp64\PREFECTA_COMME_AL_SHIFA_FullStack`, en autorisant le remplacement des fichiers du même nom. Le chemin final du nouveau fichier doit être `...\frontend\src\pages\dossier-detail.html`.
4. Ne pas toucher à `backend/.env` ; ne pas réimporter `schema.sql`, ne pas exécuter `npm run seed` ni `npm run migrate`.
5. Redémarrer : premier terminal `cd C:\wamp64\PREFECTA_COMME_AL_SHIFA_FullStack\backend` puis `npm test` et `npm start`. Deuxième terminal `cd C:\wamp64\PREFECTA_COMME_AL_SHIFA_FullStack\frontend` puis `npm run dev`.
6. Ouvrir `http://localhost:5173/src/pages/dossiers.html` ; cliquer **Voir**.

Pour utiliser `http://localhost:3000` avec Express seul, lancer `npm run build` dans le dossier `frontend` après l'extraction, puis redémarrer le backend.

## Publication GitHub

Une fois les tests réalisés depuis la racine du projet :

```powershell
git status
git add README.md GUIDE_MISE_A_JOUR.md backend/controllers/dossierController.js backend/routes/dossierRoutes.js backend/utils/rules.js backend/tests/dossier-detail.test.js backend/tests/frontend.test.js frontend/src/css/style.css frontend/src/js/main.js frontend/src/pages/dossier-detail.html
git diff --cached --name-only
git commit -m "Ajout fiche detaillee et historique des dossiers"
git push
```

**Ne publier aucun secret, aucune information personnelle réelle ni sauvegarde SQL**. Avant toute utilisation sur de vraies données administratives, une revue de sécurité et les autorisations de la préfecture sont nécessaires.
