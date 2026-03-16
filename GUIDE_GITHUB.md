# Guide : Mettre le projet sur GitHub

## ✅ Déjà fait
- Dépôt Git initialisé
- Fichiers ajoutés et commit créé (68 fichiers)
- Le fichier `.env` est dans `.gitignore` — il ne sera pas envoyé ✅

---

## ⚠️ À faire : Créer le dépôt sur GitHub

Le dépôt distant n'existe pas encore. Suivez ces étapes :

### Étape 1 : Créer le dépôt sur GitHub

1. Allez sur **https://github.com/new**
2. Remplissez :
   - **Repository name :** `projet-gestion-equipement`
   - **Description :** (optionnel) "Plateforme de gestion des équipements CDSP"
   - **Visibilité :** Public ou Private
   - ⚠️ **Ne cochez PAS** "Add a README" — le projet existe déjà
3. Cliquez sur **Create repository**

### Étape 2 : Mettre à jour l’URL du remote (si votre nom d’utilisateur GitHub est différent)

Si votre compte GitHub n’est pas `JeanClaudeABALO`, modifiez l’URL :

```bash
git remote set-url origin https://github.com/VOTRE_USERNAME/projet-gestion-equipement.git
```

### Étape 3 : Pousser le code

```bash
git push -u origin main
```

### Étape 4 : Authentification

GitHub demandera probablement une authentification :

- **Option A — Token personnel (recommandé) :**
  1. GitHub → Settings → Developer settings → Personal access tokens
  2. Generate new token (classic)
  3. Cochez au minimum `repo`
  4. Utilisez le token comme mot de passe quand Git le demande

- **Option B — GitHub CLI :**
  ```bash
  winget install GitHub.cli
  gh auth login
  ```

---

## Commandes utiles

```bash
# Vérifier le statut
git status

# Voir l'historique
git log --oneline -5

# Vérifier le remote
git remote -v
```
