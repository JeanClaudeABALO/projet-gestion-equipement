# Migration vers le système Super Administrateur

## 📋 Vue d'ensemble

Le système a été restructuré pour avoir 3 niveaux de rôles :
- **SUPER_ADMIN** : Un seul super administrateur qui peut tout gérer
- **ADMIN** : Plusieurs administrateurs avec accès complet sauf gestion des utilisateurs
- **PF** : Points Focaux départementaux (inchangé)

## 🗄️ Migration Base de Données

### Pour les nouvelles installations

Le schéma `schema.sql` inclut déjà le rôle `super_admin`.

### Pour les bases existantes

Exécutez la migration :

```bash
mysql -u root -p nom_base < database/migration_add_super_admin.sql
```

Cette migration :
1. Ajoute le rôle `super_admin` dans la table `roles`
2. Migre les admins existants vers `super_admin`

## 🔄 Changements principaux

### Backend

1. **AuthController.js** :
   - `checkAdminExists()` vérifie maintenant `super_admin` au lieu de `admin`
   - `registerAdmin()` crée un `super_admin` au lieu d'un `admin`
   - `login()` accepte les 3 rôles : `super_admin`, `admin`, `pf`

2. **utilisateursControllers.js** :
   - Seul `super_admin` peut créer/modifier/supprimer des utilisateurs
   - Peut créer des `admin` et des `pf`
   - Ne peut pas créer/modifier/supprimer le `super_admin` lui-même

3. **Routes** :
   - `/api/utilisateurs/*` : Protégé par `superAdminMiddleware` (super_admin uniquement)
   - `/api/dashboard/admin` : Accessible à `super_admin` et `admin`
   - `/api/dashboard/point-focal` : Accessible à `pf` uniquement

4. **Middlewares** :
   - `adminMiddleware.js` : Accepte `admin` et `super_admin`
   - `superAdminMiddleware.js` : Accepte uniquement `super_admin`

### Frontend

1. **Login.vue** :
   - Ajout de l'option "Super Administrateur" dans le sélecteur de rôle
   - Redirection vers `/dashboard/admin` pour `super_admin` et `admin`

2. **Home.vue** :
   - Bouton "Inscription Super Administrateur" (au lieu de "Inscription Administrateur")
   - Disparaît une fois le super admin créé

3. **SidebarAdmin.vue** :
   - Menu "Utilisateurs" visible uniquement pour `super_admin`

4. **Utilisateurs.vue** :
   - Permet de créer des `admin` et des `pf`
   - Affiche tous les utilisateurs avec leurs rôles
   - Permet de désactiver les comptes (sauf super_admin)

5. **UtilisateurModal.vue** :
   - Sélection du rôle (Administrateur ou Point Focal)
   - Département obligatoire pour PF, optionnel pour Admin

6. **Router** :
   - Route `/utilisateurs` : Accessible uniquement à `super_admin`
   - Routes admin : Accessibles à `super_admin` et `admin`

## ✅ Permissions par rôle

| Action | SUPER_ADMIN | ADMIN | PF |
|--------|-------------|-------|-----|
| Accéder au dashboard admin | ✅ | ✅ | ❌ |
| Gérer départements | ✅ | ✅ | ❌ |
| Gérer unités | ✅ | ✅ | ❌ |
| Gérer équipements | ✅ | ✅ | ✅ (son département) |
| Gérer réparations | ✅ | ✅ | ✅ (son département) |
| **Créer/modifier/supprimer utilisateurs** | ✅ | ❌ | ❌ |
| **Désactiver comptes** | ✅ | ❌ | ❌ |
| Changer son mot de passe | ✅ | ✅ | ✅ |

## 🚀 Déploiement

### Étapes

1. **Appliquer la migration SQL** (si base existante)
   ```bash
   mysql -u root -p nom_base < database/migration_add_super_admin.sql
   ```

2. **Redémarrer le backend**
   ```bash
   cd backend
   npm run dev
   ```

3. **Redémarrer le frontend**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Créer le super admin** (si pas encore fait)
   - Via le bouton "Inscription Super Administrateur" sur la page d'accueil
   - OU via le script : `node backend/scripts/initAdmin.js`

## 📝 Notes importantes

- ⚠️ **Un seul super_admin** peut exister dans le système
- ⚠️ Le super_admin ne peut pas être modifié/supprimé depuis l'interface
- ✅ Les admins simples ont le même dashboard que le super_admin
- ✅ Seul le super_admin peut gérer les utilisateurs (créer admin/PF, désactiver)
- ✅ Les admins peuvent tout faire sauf gérer les utilisateurs

## 🔍 Vérification

Pour vérifier que tout fonctionne :

1. Se connecter en tant que super_admin
2. Vérifier que le menu "Utilisateurs" est visible
3. Créer un admin simple
4. Se connecter en tant qu'admin simple
5. Vérifier que le menu "Utilisateurs" n'est PAS visible
6. Vérifier que l'admin peut accéder à tous les autres menus

