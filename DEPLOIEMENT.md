# Déploiement sur serveur interne — Vue d’ensemble

Ce document donne le **fil conducteur** pour mettre en production l’application **Gestion d’équipements** (backend Node.js + frontend Vue/Vite + base MySQL) sur un **serveur interne** (réseau d’entreprise).

Des guides plus détaillés existent pour chaque partie :

| Partie | Documentation |
|--------|----------------|
| API Node.js / Express / MySQL | [`backend/README.md`](backend/README.md) |
| Interface Vue / Vite | [`frontend/README.md`](frontend/README.md) |

---

## 1. Architecture cible (rappel)

```
[Navigateur des utilisateurs]
        |
        v
   [Nginx ou IIS]  (HTTPS recommandé, certificat interne OK)
        |
   +----+----+
   |         |
   v         v
Fichiers    API REST
statiques   Node.js
(Vue)       (Express)
   |             |
   |             v
   |        [MySQL/MariaDB]
   |
   v
(dossier `dist/` après `npm run build`)
```

Le backend expose les routes sous le préfixe **`/api`** (ex. `/api/auth`, `/api/equipements`, …).

---

## 2. Prérequis sur le serveur (ou sur des VM séparées)

- **Système** : Linux (Debian/Ubuntu recommandé) ou Windows Server ; ce guide suppose un **Linux 64 bits** pour les exemples de commandes.
- **Node.js** : **LTS** (18 ou 20), installé pour l’utilisateur de service ou globalement.
- **MySQL** 5.7+ / **MariaDB** 10.3+ avec un utilisateur dédié et une base vide (ou à créer).
- **Accès réseau** : les postes clients doivent joindre le serveur (DNS interne ou IP fixe, pare-feu ouvert sur le port HTTPS et/ou HTTP selon votre politique).

En **développement local**, les URLs par défaut sont :

- Frontend (Vite) : défini par Vite (souvent `http://localhost:5173`).
- Backend : `http://localhost:3000` (voir variable `PORT` dans `backend/server.js`).

---

## 3. Ordre des opérations recommandé

1. **Cloner ou copier** le dépôt sur le serveur (ou une machine de build).
2. **Base de données** : installer MySQL, créer la base et l’utilisateur ; exécuter `database/schema.sql` puis les migrations du dossier `database/` si nécessaire (détails dans [`backend/README.md`](backend/README.md)).
3. **Backend** : créer `backend/.env`, installer les dépendances, tester avec `npm run start`, éventuellement configurer **systemd** ou **PM2** pour que l’API redémarre au boot.
4. **Frontend** : définir `VITE_API_BASE_URL` pour pointer vers l’URL publique de l’API ; `npm run build` ; servir le dossier `frontend/dist/` avec Nginx (ou IIS).
5. **Proxy / HTTPS** : configurer Nginx (ou équivalent) devant le frontend et l’API ; ajuster CORS si l’URL du site change (voir backend).
6. **Tests** : ouvrir l’URL du site, se connecter, vérifier les appels réseau (onglet Réseau du navigateur) vers `/api/...`.

---

## 4. Variables d’environnement (résumé)

### Backend (`backend/.env`)

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `DB_HOST` | Oui | Hôte MySQL |
| `DB_PORT` | Non | Port (défaut `3306`) |
| `DB_USER` | Oui | Utilisateur MySQL |
| `DB_PASSWORD` | Non | Mot de passe (chaîne vide possible si compte sans mot de passe — déconseillé en prod) |
| `DB_NAME` | Oui | Nom de la base |
| `JWT_SECRET` | Oui | Clé secrète pour les tokens JWT (longue chaîne aléatoire en production) |
| `PORT` | Non | Port d’écoute de l’API (défaut `3000`) |

### Frontend (fichier `.env.production` à la racine de `frontend/`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | URL de base de l’API telle que vue par le navigateur, **sans** slash final inutile. Exemples : `http://192.168.1.50:3000` ou `https://gestion-api.mon-domaine.local` (le code ajoute `/api` si besoin). |

Après modification des variables **Vite**, il faut **reconstruire** le frontend : `npm run build`.

---

## 5. Sécurité (checklist minimale)

- Mot de passe fort pour MySQL et compte applicatif dédié (droits limités à la base du projet).
- `JWT_SECRET` unique et long sur le serveur de production (ne pas réutiliser celui du développement).
- HTTPS en interne si possible (certificat d’autorité interne).
- Ne pas commiter le fichier `backend/.env` ni les `.env*` contenant des secrets.
- Sauvegardes régulières de la base MySQL (`mysqldump` ou solution de sauvegarde de l’DSI).

---

## 6. Dépannage rapide

| Symptôme | Piste |
|----------|--------|
| « Network Error » / CORS | Vérifier que `VITE_API_BASE_URL` correspond à l’URL réellement appelée ; vérifier firewall ; tester `curl http://IP:3000/` sur le serveur. |
| Connexion MySQL refusée | `DB_HOST`, `DB_USER`, `DB_PASSWORD`, service MySQL démarré, utilisateur autorisé depuis `localhost` ou l’hôte du node. |
| Page blanche après déploiement | Vérifier la console du navigateur ; chemins des assets ; configuration du SPA (fallback vers `index.html` pour Vue Router). |
| 401 partout | Token / horloge serveur / `JWT_SECRET` changé sans recréer les sessions. |

Pour les détails pas à pas (commandes, Nginx, systemd, build), ouvrir les README du **backend** et du **frontend**.
