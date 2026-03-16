# Système de Changement de Mot de Passe Forcé

## 📋 Vue d'ensemble

Ce système permet de forcer le changement de mot de passe pour les utilisateurs nouvellement créés, avec une logique adaptée selon le rôle.

## 🗄️ Base de données

### Migration SQL

Pour les bases de données existantes, exécutez la migration :

```sql
-- Fichier: database/migration_add_doit_changer_mdp.sql
ALTER TABLE utilisateurs
ADD COLUMN doit_changer_mdp TINYINT(1) NOT NULL DEFAULT 1
AFTER actif;
```

**Note** : Pour les nouvelles installations, le schéma `schema.sql` inclut déjà ce champ.

### Champ `doit_changer_mdp`

- **1** = L'utilisateur doit changer son mot de passe (mot de passe temporaire)
- **0** = L'utilisateur a défini son mot de passe personnel

## 🔄 Flux de fonctionnement

### 1. Création d'un utilisateur (par ADMIN)

Quand un ADMIN crée un utilisateur :
- Le champ `doit_changer_mdp` est automatiquement défini à **1**
- Un mot de passe temporaire est attribué

```sql
INSERT INTO utilisateurs (..., doit_changer_mdp) VALUES (..., 1);
```

### 2. Connexion

Lors de la connexion (`POST /auth/login`) :

1. ✅ Vérification email/password
2. ✅ Vérification compte actif
3. 🔍 Vérification `doit_changer_mdp`

**Si `doit_changer_mdp = 1`** :
- ❌ Pas de token JWT créé
- ✅ Retour de `{ forcePasswordChange: true, userId: ... }`
- 🔄 Redirection frontend vers `/change-password`

**Si `doit_changer_mdp = 0`** :
- ✅ Token JWT créé
- ✅ Redirection vers le dashboard approprié

### 3. Changement de mot de passe

**Route** : `POST /auth/change-password`

**Payload** :
```json
{
  "userId": 123,
  "newPassword": "nouveau_mot_de_passe",
  "oldPassword": "ancien_mot_de_passe"  // Optionnel pour changement forcé
}
```

**Comportement** :
- Si `oldPassword` fourni → Vérification de l'ancien mot de passe (changement normal)
- Si `oldPassword` absent → Changement forcé (pas de vérification)
- Mise à jour : `password` + `doit_changer_mdp = 0`

## 🎯 Rôles et permissions

| Action | SUPER_ADMIN | ADMIN | PF |
|--------|-------------|-------|-----|
| Créer utilisateur | ✅ | ✅ | ❌ |
| Se connecter | ✅ | ✅ | ✅ |
| Changer son mot de passe | ✅ | ✅ | ✅ |
| Forcer changement MDP | ✅ | ✅ | ❌ |

## 📱 Frontend

### Page de changement de mot de passe

**Route** : `/change-password`

**Comportement** :
- Affiche un formulaire avec nouveau mot de passe + confirmation
- Ancien mot de passe affiché seulement si changement normal (pas forcé)
- Validation côté client (min 6 caractères, correspondance)
- Après succès → Redirection vers `/login`

### Redirection après login

Dans `Login.vue` :
```javascript
if (res.data.forcePasswordChange) {
  sessionStorage.setItem("userId", res.data.userId);
  sessionStorage.setItem("forcedChange", "true");
  this.$router.push("/change-password");
}
```

## 🔧 API Backend

### Endpoints modifiés

1. **POST /auth/login**
   - Retourne `forcePasswordChange: true` si nécessaire
   - Met à jour `last_login` uniquement si connexion réussie

2. **POST /auth/change-password** (nouveau)
   - Change le mot de passe
   - Définit `doit_changer_mdp = 0`
   - Validation : min 6 caractères

### Contrôleurs modifiés

- `AuthController.js` : Gestion du flag `forcePasswordChange`
- `utilisateursControllers.js` : Création avec `doit_changer_mdp = 1`

## ✅ Tests à effectuer

1. **Création utilisateur** :
   - ✅ Créer un PF par un ADMIN
   - ✅ Vérifier `doit_changer_mdp = 1` en base

2. **Connexion avec changement forcé** :
   - ✅ Se connecter avec le compte créé
   - ✅ Vérifier redirection vers `/change-password`
   - ✅ Changer le mot de passe
   - ✅ Vérifier redirection vers `/login`
   - ✅ Se reconnecter avec nouveau mot de passe
   - ✅ Vérifier accès au dashboard

3. **Connexion normale** :
   - ✅ Se connecter avec un compte existant (`doit_changer_mdp = 0`)
   - ✅ Vérifier accès direct au dashboard

## 🚀 Déploiement

1. **Appliquer la migration SQL** (si base existante)
2. **Redémarrer le backend**
3. **Redémarrer le frontend**
4. **Tester avec un utilisateur de test**

## 📝 Notes importantes

- ⚠️ Les utilisateurs existants doivent avoir `doit_changer_mdp = 0` (ou exécuter un UPDATE si besoin)
- ⚠️ L'admin principal créé via script a `doit_changer_mdp = 0` par défaut
- ✅ Le système fonctionne avec les rôles ADMIN et PF
- ✅ Sécurité : mots de passe hashés avec bcrypt

