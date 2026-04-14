# Frontend — Vue 3 + Vite

Interface web de la plateforme de gestion d’équipements : **Vue 3** (Composition API / `<script setup>`), **Vue Router**, **Vite 7**, **Axios**.

---

## Sommaire

1. [Prérequis](#1-prérequis)
2. [Installation et développement local](#2-installation-et-développement-local)
3. [Connexion à l’API (`VITE_API_BASE_URL`)](#3-connexion-à-lapi-vite_api_base_url)
4. [Build de production](#4-build-de-production)
5. [Déploiement des fichiers statiques](#5-déploiement-des-fichiers-statiques)
6. [Nginx — exemple complet (SPA + proxy API)](#6-nginx--exemple-complet-spa--proxy-api)
7. [Vue Router et rafraîchissement de page](#7-vue-router-et-rafraîchissement-de-page)
8. [Dépannage](#8-dépannage)

---

## 1. Prérequis

- **Node.js** LTS (18 ou 20) — pour `npm run dev` et `npm run build`.
- Un **backend** joignable depuis le navigateur (voir [`../backend/README.md`](../backend/README.md)).

---

## 2. Installation et développement local

```bash
cd frontend
npm install
npm run dev
```

Par défaut, Vite affiche l’URL locale (souvent `http://localhost:5173`).  
Le fichier `src/api/axios.js` utilise par défaut l’API à **`http://localhost:3000/api`** si aucune variable d’environnement n’est définie.

Assurez-vous que le backend tourne sur le port 3000 (ou adaptez `VITE_API_BASE_URL` — voir ci‑dessous).

### Scripts disponibles (`package.json`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement Vite (hot reload). |
| `npm run build` | Compile le projet dans **`dist/`** (fichiers à déployer). |
| `npm run preview` | Sert localement le contenu de **`dist/`** pour test après build. |

---

## 3. Connexion à l’API (`VITE_API_BASE_URL`)

Toutes les requêtes HTTP passent par `src/api/axios.js`. L’URL de base est déterminée ainsi :

1. Si la variable **`VITE_API_BASE_URL`** est définie au moment du **build**, elle est utilisée.
2. Sinon, valeur par défaut : **`http://localhost:3000/api`**.

Le code accepte :

- soit une URL **déjà terminée par `/api`** (ex. `http://192.168.1.10:3000/api`),
- soit une URL **sans** `/api` (ex. `http://192.168.1.10:3000`) : le suffixe `/api` est ajouté automatiquement.

### Développement — fichier optionnel `.env.development`

À la racine du dossier **`frontend/`**, créer par exemple :

```env
VITE_API_BASE_URL=http://localhost:3000
```

ou :

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Redémarrer `npm run dev` après modification.

### Production — fichier `.env.production`

À la racine du dossier **`frontend/`**, créer **`.env.production`** (ne pas commiter les secrets inutiles ; ici c’est surtout une URL interne) :

**Exemple 1 — API sur un autre hôte / port**

```env
VITE_API_BASE_URL=http://10.0.0.15:3000
```

**Exemple 2 — Même domaine que le site, Nginx envoie `/api` vers Node**

Si le site est `https://gestion.mon-entreprise.local` et Nginx proxifie `/api` vers le backend :

```env
VITE_API_BASE_URL=https://gestion.mon-entreprise.local
```

Les appels deviendront `https://gestion.mon-entreprise.local/api/...`.

> **Important** : les variables `VITE_*` sont injectées **au moment du `npm run build`**. Si vous changez l’URL de l’API en production, il faut **reconstruire** le frontend (`npm run build`) puis redéployer le dossier **`dist/`**.

---

## 4. Build de production

```bash
cd frontend
npm install
npm run build
```

Le résultat se trouve dans **`frontend/dist/`** :

- `index.html`
- assets JS/CSS/hashés dans `dist/assets/`

Copier tout le contenu de **`dist/`** vers le répertoire servi par votre serveur web (Nginx, IIS, etc.).

Vérifier localement avant déploiement :

```bash
npm run preview
```

---

## 5. Déploiement des fichiers statiques

1. Sur la machine de build (ou le serveur), exécuter `npm run build`.
2. Copier le contenu de **`dist/`** vers le docroot du vhhost (ex. `/var/www/gestion-equipement/html/`).
3. Configurer le serveur web pour servir **`index.html`** pour la route racine et pour le **fallback SPA** (voir section suivante).

**Permissions** : l’utilisateur du serveur web doit pouvoir lire les fichiers (souvent `www-data` sous Linux).

---

## 6. Nginx — exemple complet (SPA + proxy API)

Scénario fréquent : un seul nom d’hôte pour le site ; Nginx sert les fichiers statiques et transmet `/api` au backend Node sur `127.0.0.1:3000`.

```nginx
server {
    listen 443 ssl;
    server_name gestion.mon-entreprise.local;

    # ssl_certificate ... (chemins vers votre certificat interne)

    root /var/www/gestion-equipement/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Frontend **`.env.production`** pour ce cas :

```env
VITE_API_BASE_URL=https://gestion.mon-entreprise.local
```

Puis rebuild et copie de **`dist/`**.

Si l’API est sur **un autre serveur** (sans proxy), utilisez l’URL complète de l’API dans `VITE_API_BASE_URL` et assurez-vous que le **CORS** côté backend autorise l’origine du frontend (configuration actuelle : `app.use(cors())` — large).

---

## 7. Vue Router et rafraîchissement de page

L’application est une **SPA** : les URLs comme `/dashboard/admin` sont gérées côté navigateur.  
Sans configuration adaptée, un **F5** sur une sous‑route peut provoquer une erreur **404** côté serveur.

**Obligatoire** : règle du type `try_files $uri $uri/ /index.html;` pour `location /` (comme dans l’exemple Nginx ci‑dessus).

Sous **IIS**, utiliser le module **URL Rewrite** avec une règle vers `index.html` pour les routes non fichiers.

---

## 8. Dépannage

| Symptôme | Piste |
|----------|--------|
| Erreur réseau, `ECONNABORTED`, URL incorrecte dans l’onglet Réseau | Reconstruire avec le bon `VITE_API_BASE_URL` ; vérifier HTTPS/HTTP et le pare-feu. |
| CORS dans la console | Aligner l’origine du site et la config `cors` du backend ; ou servir l’API derrière le même domaine via `/api`. |
| Page blanche | Ouvrir la console (F404 sur `assets/…` = mauvais `base` Vite ou mauvais chemin de déploiement). |
| API en HTTP et site en HTTPS | « Mixed content » bloqué : passer l’API en HTTPS ou proxifier sous le même HTTPS. |

---

## Documentation liée

- [**`../DEPLOIEMENT.md`**](../DEPLOIEMENT.md) — vue d’ensemble déploiement serveur interne.
- [**`../backend/README.md`**](../backend/README.md) — API Node.js, MySQL, systemd, Nginx côté backend.
