# Plateforme de gestion d’équipements

Application web pour le suivi des équipements (départements, unités, états, réparations, utilisateurs).

## Structure du dépôt

| Dossier | Rôle |
|---------|------|
| **`backend/`** | API REST Node.js + Express + MySQL |
| **`frontend/`** | Interface Vue 3 + Vite |
| **`database/`** | Scripts SQL (schéma, migrations) |

---

## Déploiement sur serveur interne

Guide principal (parcours global, prérequis, checklist) :

- **[`DEPLOIEMENT.md`](DEPLOIEMENT.md)**

Guides détaillés par composant :

| Guide | Contenu |
|-------|---------|
| **[`backend/README.md`](backend/README.md)** | Installation, `.env`, MySQL, `npm start`, systemd/PM2, Nginx, routes `/api` |
| **[`frontend/README.md`](frontend/README.md)** | `npm run build`, `VITE_API_BASE_URL`, déploiement de `dist/`, Nginx SPA, Vue Router |

---

## Développement rapide (local)

1. **Base de données** : importer `database/schema.sql` (voir `backend/README.md`).
2. **Backend** : `cd backend && cp` créer `.env` `&& npm install && npm run dev`
3. **Frontend** : `cd frontend && npm install && npm run dev`

L’API par défaut est sur le port **3000** ; le frontend pointe vers cette API (voir `frontend/README.md` pour personnaliser l’URL).

---

## Licence / usage

Usage interne selon la politique de votre organisation.
