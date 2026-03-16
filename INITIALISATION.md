# Guide d'Initialisation du Système

## 🔐 Création de l'Administrateur Principal

Le système nécessite **un seul administrateur principal** qui est créé au démarrage via un script d'initialisation.

### Étapes d'initialisation

1. **Configurer les variables d'environnement** (optionnel)

   Créez un fichier `.env` dans le dossier `backend/` avec :

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=votre_mot_de_passe
   DB_NAME=gestion_equipement
   JWT_SECRET=votre_secret_jwt_tres_securise
   
   # Optionnel : Personnaliser les identifiants de l'admin
   ADMIN_EMAIL=admin@gestion-equipement.bj
   ADMIN_PASSWORD=Admin@2025!
   ADMIN_NOM=Administrateur Principal
   ```

2. **Créer la base de données**

   Exécutez le script SQL pour créer les tables :

   ```bash
   mysql -u root -p < database/schema.sql
   ```

3. **Créer l'administrateur principal**

   ```bash
   cd backend
   node scripts/initAdmin.js
   ```

   Le script va :
   - Vérifier qu'aucun admin n'existe déjà
   - Créer le compte administrateur principal
   - Afficher les identifiants de connexion

   ⚠️ **IMPORTANT** : Notez les identifiants affichés et changez le mot de passe après la première connexion !

### Identifiants par défaut (si non configurés dans .env)

- **Email** : `admin@gestion-equipement.bj`
- **Mot de passe** : `Admin@2025!`

## 🚀 Démarrage de l'application

### Backend

```bash
cd backend
npm install
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application démarre sur `http://localhost:5173` (ou un autre port selon Vite)

## 👥 Création des Points Focaux

Une fois connecté en tant qu'**Administrateur** :

1. Allez dans **Utilisateurs** (menu latéral)
2. Cliquez sur **"Créer un Point Focal"**
3. Remplissez le formulaire :
   - Nom complet
   - Email (unique)
   - Mot de passe
   - Téléphone (optionnel)
   - **Département** (obligatoire)

⚠️ **Règles importantes** :
- Seul l'administrateur peut créer des Points Focaux
- Un Point Focal doit être rattaché à un département
- Il ne peut exister qu'un seul administrateur principal
- Les Points Focaux ne peuvent pas créer d'autres utilisateurs

## 🔒 Sécurité

- Tous les mots de passe sont hashés avec bcrypt
- Les tokens JWT expirent après 8 heures
- Les routes sensibles nécessitent une authentification
- Seul l'admin peut gérer les utilisateurs et les départements
- Les Points Focaux ne voient que les équipements de leur département

## 📝 Notes

- Le script `initAdmin.js` peut être exécuté plusieurs fois sans risque : il vérifie d'abord si un admin existe déjà
- Pour réinitialiser l'admin, supprimez-le manuellement de la base de données puis réexécutez le script
- Les Points Focaux peuvent modifier l'état des équipements de leur département uniquement

