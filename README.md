# PREFECTA — architecture Full Stack comparable à Al-Shifa

Cette version **réorganise le code existant** en `controllers`, `routes`, `middlewares`, `config`, et `frontend/src/pages`, **sans remplacer la base `prefecta_ali_sabieh`**.

## Démarrer avec WAMP64 (Windows / VS Code)

1. **Faire un export SQL** de `prefecta_ali_sabieh` dans phpMyAdmin. Ne pas réimporter `schema.sql`, ne pas relancer `seed` sur une base existante.
2. Copier l'ancien fichier `.env` **privé** dans `backend/.env`, puis renouveler les secrets déjà exposés. Dans `.env`, `DB_NAME=prefecta_ali_sabieh`.
3. Démarrer WAMP64 puis ouvrir **deux terminaux** VS Code.

**Terminal 1 — backend**

```powershell
cd C:\wamp64\PREFECTA_ARCHITECTURE_AL_SHIFA\backend
npm install
npm run doctor
npm run verify-auth
npm run check
npm test
npm start
```

**Terminal 2 — frontend Vite**

```powershell
cd C:\wamp64\PREFECTA_ARCHITECTURE_AL_SHIFA\frontend
npm install
npm run dev
```

Ouvrir **http://127.0.0.1:5173** ; Vite transfère `/api` vers le backend Node sur 3000.

## Version intégrée (un seul serveur après compilation)

```powershell
cd C:\wamp64\PREFECTA_ARCHITECTURE_AL_SHIFA\frontend
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
- `frontend/src/pages` — 7 pages HTML réellement distinctes.
- `frontend/src/js/main.js` — interactions et appels API ; `layout.js`, `permissions.js` — fonctions communes.
- `frontend/src/css/style.css` — design.
- `database/schema.sql` — exemple pour **nouvelle installation uniquement**.
- `analytics/analyse.py` — analyse CSV.

## Notes importantes

Cette archive conserve les comportements métier de la V3.1 ; la réorganisation ne signifie pas qu'un audit de sécurité a été réalisé. La base n'est pas fournie dans le ZIP. Une utilisation institutionnelle avec données de citoyens exige autorisation, tests d'intégration, sauvegardes, HTTPS, stratégie de protection des données et validation opérationnelle.
