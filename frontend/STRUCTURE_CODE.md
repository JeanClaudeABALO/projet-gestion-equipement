# Structure du code - Séparation HTML / JavaScript / CSS

## Organisation adoptée

Le code est organisé avec une séparation claire entre :
- **Template (HTML)** : reste dans les fichiers `.vue`
- **Script (JavaScript)** : dans `src/scripts/`
- **Styles (CSS)** : dans `src/styles/`

## Structure des dossiers

```
src/
├── scripts/                 # Logique JavaScript
│   ├── App.js
│   ├── AppHeader.js
│   ├── AppFooter.js
│   ├── SidebarAdmin.js
│   ├── SidebarPointFocal.js
│   └── pages/
│       ├── Login.js
│       └── Home.js
│
├── styles/                  # Feuilles de style
│   ├── App.css
│   ├── AppHeader.css
│   ├── AppFooter.css
│   ├── SidebarAdmin.css
│   ├── SidebarPointFocal.css
│   └── pages/
│       ├── Login.css
│       └── Home.css
│
├── components/             # Composants Vue (template + imports)
├── pages/
└── ...
```

## Pattern utilisé

Vue 3 ne supporte pas `<script setup src="...">`. On utilise donc le **pattern composable** :

### 1. Script externe (`scripts/NomComposant.js`)

```javascript
export function useNomComposant() {
  // Toute la logique ici
  const maVariable = ref("");
  function maFonction() { ... }
  
  return {
    maVariable,
    maFonction
  };
}
```

### 2. Fichier Vue (`components/NomComposant.vue`)

```vue
<template>
  <div>{{ maVariable }}</div>
</template>

<script setup>
import { useNomComposant } from "../scripts/NomComposant.js";

const { maVariable, maFonction } = useNomComposant();
</script>
<style scoped src="../styles/NomComposant.css"></style>
```

### 3. Styles externes (`styles/NomComposant.css`)

Les styles sont chargés via `src`. L'attribut `scoped` est conservé si nécessaire.

## Chemins relatifs

| Emplacement du .vue | Chemin vers script | Chemin vers style |
|--------------------|-------------------|-------------------|
| `src/App.vue` | `./scripts/App.js` | `./styles/App.css` |
| `src/components/X.vue` | `../scripts/X.js` | `../styles/X.css` |
| `src/pages/X.vue` | `../scripts/pages/X.js` | `../styles/pages/X.css` |

## Composants déjà refactorisés

- ✅ App.vue
- ✅ AppHeader.vue
- ✅ AppFooter.vue
- ✅ SidebarAdmin.vue
- ✅ SidebarPointFocal.vue
- ✅ Login.vue
- ✅ Home.vue

## Composants à refactoriser (même pattern)

Les autres pages et composants (Departements, Equipements, Modals, etc.) peuvent être refactorisés en suivant le même pattern.
