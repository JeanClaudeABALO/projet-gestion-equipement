# Backend — API Express (Node.js)

API REST pour la plateforme de gestion d’équipements. Stack : **Node.js**, **Express 5**, **MySQL** (via `mysql2`), **JWT**, **bcryptjs**.

---

## Sommaire

1. [Prérequis](#1-prérequis)
2. [Installation locale (développement)](#2-installation-locale-développement)
3. [Configuration `.env`](#3-configuration-env)
4. [Base de données](#4-base-de-données)
5. [Démarrage](#5-démarrage)
6. [Déploiement sur serveur interne (production)](#6-déploiement-sur-serveur-interne-production)
7. [Référence des routes API](#7-référence-des-routes-api)
8. [Dépannage](#8-dépannage)

---

## 1. Prérequis

- **Node.js** LTS (18 ou 20 recommandé).
- **MySQL** 5.7+ ou **MariaDB** 10.3+.
- Accès pour créer une base et un utilisateur SQL (ou compte fourni par la DSI).

---

## 2. Installation locale (développement)

À exécuter depuis le dossier **`backend/`** :

```bash
cd backend
npm install
```

Le fichier `package.json` expose :

| Script | Commande | Usage |
|--------|----------|--------|
| `dev` | `nodemon server.js` | Développement avec rechargement automatique |
| `start` | `node server.js` | Production / test sans nodemon |

---

## 3. Configuration `.env`

Créer un fichier **`backend/.env`** à la racine du dossier `backend` (même niveau que `server.js`).

### Variables obligatoires

Le fichier `src/config/db.js` exige au minimum :

```env
DB_HOST=127.0.0.1
DB_USER=votre_user
DB_NAME=gestion_equipements
JWT_SECRET=une_phrase_secrete_longue_et_aleatoire
```

### Variables optionnelles

```env
DB_PORT=3306
DB_PASSWORD=mot_de_passe_mysql
PORT=3000
JWT_EXPIRES_IN=24h
```

| Variable | Description |
|----------|-------------|
| `DB_HOST` | Adresse du serveur MySQL (`127.0.0.1` ou IP/nom du serveur de base). |
| `DB_PORT` | Port MySQL (défaut **3306** si absent). |
| `DB_USER` | Utilisateur MySQL. |
| `DB_PASSWORD` | Mot de passe ; peut être vide si votre configuration l’autorise (non recommandé en production). |
| `DB_NAME` | Nom de la base de données. |
| `JWT_SECRET` | Clé utilisée pour signer les tokens JWT — **obligatoire** et doit rester secrète. Si vous la modifiez, tous les utilisateurs doivent se reconnecter. |
| `JWT_EXPIRES_IN` | Durée de vie du token JWT (ex. `24h`, `7d`, `480m`). Défaut **`24h`**. Ancienne valeur du code : `8h`. |
| `PORT` | Port HTTP sur lequel écoute l’API (défaut **3000**). |

> **Important** : ne jamais committer `.env` contenant des secrets réels. Ajoutez `.env` au `.gitignore` si ce n’est pas déjà fait.

Au démarrage, une connexion test est faite : un message du type `Connecté à MySQL` confirme que la base répond.

---

## 4. Base de données

Les scripts SQL sont dans le dossier **`../database/`** (à la racine du projet monorepo).

### Ordre recommandé (nouvelle installation)

1. **`database/schema.sql`** — crée les tables, les rôles de base, etc.
2. Selon votre version du schéma et l’historique du projet, appliquer si besoin :
   - **`database/migration_add_doit_changer_mdp.sql`** — ajoute la colonne `doit_changer_mdp` sur `utilisateurs` si elle n’existe pas encore.
   - **`database/migration_add_super_admin.sql`** — à utiliser avec précaution (modifie des rôles) ; le schéma initial peut déjà contenir le rôle `super_admin`.

### Création manuelle de la base (exemple MySQL)

```sql
CREATE DATABASE gestion_equipements CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'app_equipement'@'localhost' IDENTIFIED BY 'mot_de_passe_solide';
GRANT ALL PRIVILEGES ON gestion_equipements.* TO 'app_equipement'@'localhost';
FLUSH PRIVILEGES;
```

Puis importer le schéma :

```bash
mysql -u app_equipement -p gestion_equipements < ../database/schema.sql
```

Adapter le chemin `../database/` selon l’emplacement depuis lequel vous lancez la commande.

### Compte administrateur initial

Le schéma ou la documentation métier (ex. `CHANGEMENT_MOT_DE_PASSE.md`) peut décrire la création du premier utilisateur. Si des scripts `initAdmin` ont été retirés du dépôt, créez un utilisateur via l’API ou un `INSERT` contrôlé selon la structure de la table `utilisateurs`.

---

## 5. Démarrage

### Développement

```bash
cd backend
npm run dev
```

L’API écoute sur `http://localhost:PORT` (port défini par `PORT` ou 3000).

### Vérification rapide

Ouvrir ou appeler :

```text
GET http://localhost:3000/
```

Réponse attendue : texte indiquant que l’API est opérationnelle.

Tester une route protégée nécessite un JWT obtenu via `/api/auth/login`.

---

## 6. Déploiement sur serveur interne (production)

### 6.1 Copier les fichiers

Sur le serveur, placer le dossier `backend/` (sans `node_modules` si vous réinstallez sur place). Exemple :

```bash
/opt/gestion-equipement/backend
```

### 6.2 Installer les dépendances (production)

```bash
cd /opt/gestion-equipement/backend
npm install --omit=dev
```

`--omit=dev` évite d’installer `nodemon` en production (optionnel si vous préférez `npm install` complet).

### 6.3 Configurer `.env` sur le serveur

Reprendre la section [Configuration `.env`](#3-configuration-env). Vérifier en particulier :

- `DB_HOST` : si MySQL est sur la **même machine**, `127.0.0.1` ; si **autre serveur**, nom d’hôte ou IP + droits MySQL pour cette IP (`'user'@'10.%'` etc.).
- `JWT_SECRET` : valeur **forte** et unique pour la production.
- `PORT` : souvent `3000` en local sur le serveur ; Nginx fera ensuite le proxy vers ce port.

### 6.4 Lancer l’API en tâche de fond

#### Option A — systemd (Linux)

Créer `/etc/systemd/system/gestion-equipement-api.service` (adapter chemins et utilisateur) :

```ini
[Unit]
Description=API Gestion équipements
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/gestion-equipement/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Puis :

```bash
sudo systemctl daemon-reload
sudo systemctl enable gestion-equipement-api
sudo systemctl start gestion-equipement-api
sudo systemctl status gestion-equipement-api
```

#### Option B — PM2

```bash
npm install -g pm2
cd /opt/gestion-equipement/backend
pm2 start server.js --name gestion-api
pm2 save
pm2 startup
```

### 6.5 Reverse proxy (Nginx) — exemple

Si Nginx reçoit le trafic sur le port 443 et doit transmettre `/api` vers Node :

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Dans ce cas, le **frontend** doit utiliser la **même origine** que le site (ex. `https://gestion.entreprise.local`) et définir `VITE_API_BASE_URL` en conséquence (voir `frontend/README.md`). Les appels iront vers `https://gestion.entreprise.local/api/...`.

**CORS** : `server.js` charge `cors()` en mode large. Pour restreindre aux origines internes, vous pouvez remplacer par `cors({ origin: 'https://gestion.entreprise.local' })` dans `src/app.js` (à coordonner avec l’équipe).

### 6.6 Pare-feu

Ouvrir uniquement ce qui est nécessaire :

- Si tout passe par Nginx : ports **80/443** vers le serveur web ; **ne pas** exposer le port `3000` sur Internet si non nécessaire.
- Accès direct à l’API : autoriser le port `PORT` depuis les seuls clients autorisés.

---

## 7. Référence des routes API

Préfixe global **`/api`** (défini dans `src/app.js`) :

| Préfixe | Fichier de routes |
|---------|-------------------|
| `/api/auth` | `routes/auth.js` |
| `/api/dashboard` | `routes/dashboard.js` |
| `/api/equipements` | `routes/equipements.js` |
| `/api/unites` | `routes/unites.js` |
| `/api/departements` | `routes/departements.js` |
| `/api/equipements-types` | `routes/equipements_types.js` |
| `/api/utilisateurs` | `routes/utilisateurs.js` |
| `/api/roles` | `routes/roles.js` |
| `/api/logs` | `routes/logs.js` |
| `/api/mouvements` | `routes/mouvements.js` |
| `/api/reparations` | `routes/reparations.js` |

---

## 8. Dépannage

| Problème | Action |
|----------|--------|
| Erreur au démarrage sur variables manquantes | Vérifier `DB_HOST`, `DB_USER`, `DB_NAME`, `JWT_SECRET` dans `.env`. |
| `ER_ACCESS_DENIED_ERROR` | Utilisateur/mot de passe MySQL incorrects. |
| `ECONNREFUSED` | MySQL arrêté ou mauvais `DB_HOST`/`DB_PORT`. |
| `ER_BAD_DB_ERROR` | Créer la base ou corriger `DB_NAME` ; importer `schema.sql`. |
| L’API ne répond pas depuis un autre PC | Pare-feu, `PORT`, ou Nginx mall configuré. |

Pour la partie interface, voir [**`../frontend/README.md`**](../frontend/README.md) et [**`../DEPLOIEMENT.md`**](../DEPLOIEMENT.md).
