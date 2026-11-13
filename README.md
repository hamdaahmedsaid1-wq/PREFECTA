# PREFECTA — architecture Full Stack comparable à Al-Shifa

Cette version **réorganise le code existant** en `controllers`, `routes`, `middlewares`, `config`, et `frontend/src/pages`, **sans remplacer la base `prefecta_ali_sabieh`**.

## Démarrer avec WAMP64 (Windows / VS Code)

1. **Faire un export SQL** de `prefecta_ali_sabieh` dans phpMyAdmin. Ne pas réimporter `schema.sql`, ne pas relancer `seed` sur une base existante.
2. Copier l'ancien fichier `.env` **privé** dans `backend/.env`, puis renouveler les secrets déjà exposés. Dans `.env`, `DB_NAME=prefecta_ali_sabieh`.
3. Démarrer WAMP64 puis ouvrir **deux terminaux** VS Code.

**Terminal 1 — backend**

```powershell
cd C:\wamp64\PREFECTA_COMME_AL_SHIFA_FullStack\backend
npm install
npm run doctor
npm run verify-auth
npm run check
npm test
npm start
```

**Terminal 2 — frontend Vite**

```powershell
cd C:\wamp64\PREFECTA_COMME_AL_SHIFA_FullStack\frontend
npm install
npm run dev
```

Ouvrir **http://127.0.0.1:5173** ; Vite transfère `/api` vers le backend Node sur 3000.

## Version intégrée (un seul serveur après compilation)

```powershell
cd C:\wamp64\PREFECTA_COMME_AL_SHIFA_FullStack\frontend
npm install
npm run build
cd ..\backend
npm start
```

Puis ouvrir **http://127.0.0.1:3000** (Express sert `frontend/dist`).

## Dossiers

- `backend/config/database.js` — pool MySQL.
- `backend/controllers` — opérations métier.
- `backend/routes` — déclarations des routes API.
- `backend/middlewares` — authentification JWT, rôles.
- `backend/utils/rules.js` — validations et permissions.
- `backend/scripts` — migration additive, diagnostic et compte admin.
- `frontend/src/pages` — 8 pages HTML réellement distinctes, dont la fiche détaillée des dossiers.
- `frontend/src/js/main.js` — interactions et appels API ; `layout.js`, `permissions.js` — fonctions communes.
- `frontend/src/css/style.css` — design.
- `database/schema.sql` — exemple pour **nouvelle installation uniquement**.
- `analytics/analyse.py` — analyse CSV.

## Notes importantes

Cette archive conserve les comportements métier de la V3.1 ; la réorganisation ne signifie pas qu'un audit de sécurité a été réalisé. La base n'est pas fournie dans le ZIP. Une utilisation institutionnelle avec données de citoyens exige autorisation, tests d'intégration, sauvegardes, HTTPS, stratégie de protection des données et validation opérationnelle.

## Extension : fiche de suivi des dossiers

- Dans **Dossiers administratifs**, le bouton **Voir** ouvre une fiche dédiée (`dossier-detail.html?id=...`).
- Fiche : numéro, demandeur, objet, service, catégorie, état, priorité, observations, dates et créateur.
- Historique : opérations enregistrées dans `journal_activite`, avec acteur et date.
- **Imprimer** ouvre l'impression du navigateur ; **Modifier** reprend le formulaire existant pour les rôles autorisés.
- Routes protégées : `GET /api/dossiers/:id` et `GET /api/dossiers/:id/historique`. Les agents et lecteurs ne consultent que leur service ; les autres dossiers renvoient 404.
- Pas de migration SQL : compatible avec les données existantes après la migration V3 déjà réalisée.

### Mettre à jour une installation existante

Faire une **copie de sauvegarde du code et un export SQL** avant remplacement. Copier les fichiers de l'archive de mise à jour **en conservant leurs chemins relatifs**, par-dessus les fichiers existants. **Ne jamais remplacer `backend/.env`** et ne réimporter ni `database/schema.sql` ni les données de test. Redémarrer le backend et le serveur Vite ; pour l'accès par `http://localhost:3000`, reconstruire d'abord `frontend/dist` avec `npm run build` dans `frontend`.

### Vérifier après la mise à jour

1. Se connecter en Administrateur ; ouvrir **Dossiers administratifs** puis cliquer **Voir** sur une ligne.
2. Vérifier que la fiche correspond à un vrai dossier déjà enregistré et afficher son historique.
3. Tester **Imprimer** et **Modifier**.
4. Connecter un Agent affecté à un service ; il ne doit pas pouvoir lire la fiche d'un autre service, même en saisissant directement l'URL.
5. Lancer `npm test` depuis `backend` puis `npm run build` depuis `frontend`.

> Il s'agit d'une amélioration testée localement par tests automatisés, **pas** d'une validation d'utilisation en production sur des données administratives réelles.
