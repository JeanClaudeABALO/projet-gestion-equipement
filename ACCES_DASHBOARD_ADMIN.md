# 🔐 Accès au Dashboard du Super Administrateur

## Vue d'ensemble

Le **Super Administrateur** (ou Administrateur Principal) est l'utilisateur avec le rôle **"admin"** qui a les droits complets sur la plateforme. Il est créé via un script d'initialisation et est le seul à pouvoir gérer les utilisateurs et les départements.

## 📋 Étapes pour accéder au dashboard

### Étape 1 : Créer le compte administrateur principal

**Si ce n'est pas encore fait**, exécutez le script d'initialisation :

```bash
cd backend
node scripts/initAdmin.js
```

**Identifiants par défaut** :
- **Email** : `admin@gestion-equipement.bj`
- **Mot de passe** : `Admin@2025!`

💡 **Note** : Vous pouvez personnaliser ces identifiants dans le fichier `backend/.env` :
```env
ADMIN_EMAIL=votre@email.com
ADMIN_PASSWORD=VotreMotDePasse123!
ADMIN_NOM=Votre Nom
```

### Étape 2 : Accéder à la page de connexion

1. Démarrez le frontend :
   ```bash
   cd frontend
   npm run dev
   ```

2. Ouvrez votre navigateur et allez sur :
   ```
   http://localhost:5173/login
   ```
   (ou le port indiqué par Vite)

### Étape 3 : Se connecter

Sur la page de connexion :

1. **Sélectionnez le rôle** : Choisissez **"Administrateur Central"** dans le menu déroulant
2. **Entrez l'email** : `admin@gestion-equipement.bj` (ou votre email personnalisé)
3. **Entrez le mot de passe** : `Admin@2025!` (ou votre mot de passe personnalisé)
4. **Cliquez sur "Se connecter"**

### Étape 4 : Accès au dashboard

Après une connexion réussie, vous êtes automatiquement redirigé vers :
```
http://localhost:5173/dashboard/admin
```

## 🎯 Fonctionnalités du Dashboard Admin

Une fois connecté, vous avez accès à :

### 📊 Menu latéral (Sidebar)
- **Tableau de bord** : Vue d'ensemble des statistiques
- **Départements** : Gestion des départements
- **Unités** : Gestion des unités par département
- **Équipements** : Gestion complète des équipements
- **Utilisateurs** : Création et gestion des Points Focaux
- **Réparations** : Suivi des demandes de réparation

### ✅ Permissions
- ✅ Créer, modifier, supprimer des départements
- ✅ Créer, modifier, supprimer des unités
- ✅ Gérer tous les équipements (tous départements)
- ✅ Créer des comptes Points Focaux
- ✅ Modifier/supprimer des Points Focaux
- ✅ Voir toutes les statistiques globales
- ✅ Gérer toutes les réparations

## 🔒 Sécurité

### Changement de mot de passe

⚠️ **Important** : Après la première connexion, changez votre mot de passe !

1. Le compte admin principal a `doit_changer_mdp = 0` (pas de changement forcé)
2. Pour changer votre mot de passe :
   - Utilisez la fonctionnalité de changement de mot de passe (si disponible dans l'interface)
   - Ou modifiez directement en base de données (non recommandé)

### Restrictions

- ❌ **Un seul administrateur principal** peut exister
- ❌ Les Points Focaux **ne peuvent pas** créer d'autres utilisateurs
- ❌ Les Points Focaux **ne peuvent pas** gérer les départements

## 🚨 Problèmes courants

### "Aucun utilisateur trouvé avec ce rôle"
- ✅ Vérifiez que vous avez sélectionné le rôle **"Administrateur Central"**
- ✅ Vérifiez que l'admin existe dans la base de données :
  ```sql
  SELECT * FROM utilisateurs u 
  JOIN roles r ON u.role_id = r.id 
  WHERE r.code = 'admin';
  ```

### "Mot de passe incorrect"
- ✅ Vérifiez que vous utilisez le bon mot de passe
- ✅ Si vous avez changé le mot de passe, utilisez le nouveau

### Redirection vers "/change-password"
- Cela signifie que `doit_changer_mdp = 1` dans la base
- Pour l'admin principal, cela ne devrait pas arriver
- Solution : Mettre à jour en base :
  ```sql
  UPDATE utilisateurs SET doit_changer_mdp = 0 WHERE id = <admin_id>;
  ```

### "Accès refusé"
- ✅ Vérifiez que vous êtes bien connecté (token présent)
- ✅ Vérifiez le rôle dans localStorage : `localStorage.getItem("role")` doit être `"admin"`

## 📝 URLs importantes

- **Connexion** : `/login`
- **Dashboard Admin** : `/dashboard/admin`
- **Utilisateurs** : `/utilisateurs` (accessible depuis le menu)
- **Départements** : `/departements` (accessible depuis le menu)

## 🔄 Déconnexion

Pour vous déconnecter :
1. Cliquez sur le bouton **"Déconnexion"** dans le header ou la sidebar
2. Vous serez redirigé vers la page d'accueil

---

💡 **Conseil** : Gardez vos identifiants admin en sécurité et changez le mot de passe après la première connexion !

