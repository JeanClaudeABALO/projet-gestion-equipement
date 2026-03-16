# Guide : Mettre le projet sur GitHub

## État actuel
- ✅ Dépôt Git initialisé
- ✅ Connecté à : https://github.com/JeanClaudeABALO/projet-gestion-equipement
- ⏳ Modifications à committer et pousser

---

## Étapes à suivre

### Étape 1 : Vérifier que le fichier .env n'est pas versionné
Le fichier `.env` (mots de passe, clés) est déjà dans `.gitignore` — il ne sera pas envoyé sur GitHub. ✅

### Étape 2 : Ajouter tous les fichiers modifiés
```bash
git add .
```

### Étape 3 : Créer un commit avec un message descriptif
```bash
git commit -m "Refonte complète : format WabaJob, images de fond, animations, super admin"
```

### Étape 4 : Pousser vers GitHub
```bash
git push -u origin main
```

**Note :** Si c'est la première fois, GitHub peut demander une authentification :
- **Option A :** Token personnel (recommandé) — Créez un token sur GitHub → Settings → Developer settings → Personal access tokens
- **Option B :** GitHub CLI — Installez `gh` et faites `gh auth login`

---

## En cas de conflit ou d'erreur

### Erreur "rejected" (l'historique distant a changé)
```bash
git pull origin main --rebase
git push origin main
```

### Vérifier le statut
```bash
git status
```

### Voir l'historique des commits
```bash
git log --oneline -5
```
