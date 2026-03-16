<script setup>
import { computed, ref, onMounted, watch, inject } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

// Injecter l'état de la sidebar
const sidebarOpen = inject('sidebarOpen', ref(true));
const toggleSidebar = inject('toggleSidebar', () => {});

// État réactif pour l'authentification et le rôle
const isAuthenticated = ref(!!localStorage.getItem("token"));
const userRole = ref(localStorage.getItem("role"));

// Mettre à jour l'état quand le localStorage change
function updateAuthState() {
  isAuthenticated.value = !!localStorage.getItem("token");
  userRole.value = localStorage.getItem("role");
}

// Écouter les changements de route pour mettre à jour l'état
watch(() => route.path, () => {
  updateAuthState();
});

onMounted(() => {
  updateAuthState();
  // Écouter les événements de stockage pour détecter les changements
  window.addEventListener('storage', updateAuthState);
});

// Menu public institutionnel
const publicMenuItems = [
  { label: "Accueil", path: "/" },
  { label: "La Plateforme", path: "/la-plateforme" },
  { label: "Équipements", path: "/equipements-public" },
  { label: "Statistiques", path: "/statistiques" },
  { label: "Contact", path: "/contact" }
];

// Menu pour administrateur (dans l'espace sécurisé)
const adminMenuItems = [
  { label: "Départements", path: "/departements" },
  { label: "Unités", path: "/unites" },
  { label: "Equipements", path: "/equipements" },
  { label: "Utilisateurs", path: "/utilisateurs" },
  { label: "Réparations", path: "/reparations" }
];

// Menu pour point focal (dans l'espace sécurisé)
const pointFocalMenuItems = [
  { label: "Unités", path: "/dashboard-point-focal/unites" },
  { label: "Equipements", path: "/equipements" },
  { label: "Réparations", path: "/dashboard-point-focal/reparations" }
];

// Obtenir les items du menu selon le contexte
const menuItems = computed(() => {
  if (isAuthenticated.value) {
    const role = userRole.value;
    if (role === "admin" || role === "super_admin") {
      return adminMenuItems;
    } else if (role === "pf") {
      return pointFocalMenuItems;
    }
  }
  return publicMenuItems;
});

// Vérifier si un lien est actif
function isActive(path) {
  if (path === "/" && route.path === "/") return true;
  if (path !== "/" && route.path.startsWith(path)) return true;
  return false;
}

// Fonction de déconnexion
function logout() {
  if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
    // Supprimer les données du localStorage immédiatement
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    
    // Mettre à jour l'état immédiatement
    updateAuthState();
    
    // Déclencher un événement personnalisé pour notifier les autres composants
    window.dispatchEvent(new Event('storage'));
    
    // Utiliser le router Vue pour une redirection instantanée (beaucoup plus rapide que window.location)
    router.replace("/");
  }
}

// Fonction pour accéder à la plateforme
function goToPlatform() {
  if (isAuthenticated.value) {
    if (userRole.value === "admin") {
      router.push("/dashboard/admin");
    } else if (userRole.value === "pf") {
      router.push("/dashboard-point-focal");
    }
  } else {
    router.push("/login");
  }
}
</script>

<template>
  <header class="app-header" role="banner">
    <div class="app-header__inner">
      <!-- Texte institutionnel à gauche -->
      <div class="left">
        <div class="brand">
          <h1 class="ministry-title">MINISTÈRE DE LA JUSTICE</h1>
          <p class="republic-text">RÉPUBLIQUE DU BÉNIN</p>
          <div class="flag-strip">
            <span class="flag-color green"></span>
            <span class="flag-color yellow"></span>
            <span class="flag-color red"></span>
          </div>
        </div>
      </div>

      <!-- Menu central -->
      <div class="center">
        <nav class="header-menu">
          <a
            v-for="item in menuItems"
            :key="item.path"
            :href="item.path"
            @click.prevent="router.push(item.path)"
            :class="['menu-link', { active: isActive(item.path) }]"
          >
            {{ item.label }}
          </a>
        </nav>
      </div>

      <!-- Actions à droite -->
      <div class="right">
        <button 
          v-if="!isAuthenticated" 
          class="btn-secondary" 
          @click="router.push('/login')"
        >
          Connexion
        </button>
        <button 
          v-if="!isAuthenticated" 
          class="btn-primary" 
          @click="goToPlatform()"
        >
          Accès plateforme
        </button>
        <button 
          v-else 
          class="logout-btn" 
          @click="logout"
        >
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span class="label">Déconnexion</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Bouton dépliant sidebar - coin supérieur gauche (uniquement si connecté) -->
  <button 
    v-if="isAuthenticated" 
    class="sidebar-toggle-btn-fixed" 
    @click="toggleSidebar"
    :title="sidebarOpen ? 'Masquer le menu' : 'Afficher le menu'"
  >
    <span class="icon">☰</span>
  </button>
</template>

<style>
/* FIXED header full width */
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: linear-gradient(135deg,#1ca492  10%, #0a5bc4 50%, #0d7a3d 100%);
  border-bottom: 3px solid #f1c40f;
}

.sidebar-toggle-btn-fixed {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(7, 59, 117, 0.95);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 22px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.sidebar-toggle-btn-fixed:hover {
  background: rgba(7, 59, 117, 1);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.sidebar-toggle-btn-fixed .icon {
  display: block;
  line-height: 1;
}

/* inner area (top row) - centered content */
.app-header__inner {
  max-width: 1400px;        /* center content inside full-width header */
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;             /* fixed top-row height */
  padding: 0 20px;
  box-sizing: border-box;
  position: relative;
}

/* left area: brand (sans logo) */
.left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.ministry-title {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
  white-space: nowrap;
}

.republic-text {
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
  white-space: nowrap;
}

.flag-strip {
  display: flex;
  width: 100%;
  max-width: 200px;
  height: 8px;
  margin-top: 2px;
  border-radius: 2px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.flag-color {
  flex: 1;
  height: 100%;
}

.flag-color.green {
  background: #008751;
}

.flag-color.yellow {
  background: #FCD116;
}

.flag-color.red {
  background: #E8112D;
}

/* center menu */
.center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0; /* Permet au flex de rétrécir si nécessaire */
}

.header-menu {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
}

.menu-link {
  color: white !important;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
  display: inline-block;
}

.menu-link:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.menu-link.active {
  background: rgba(255, 255, 255, 0.25) !important;
  border-color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
}

/* right action */
.right { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
}

.btn-primary {
  background: #0a5bc4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-primary:hover {
  background: #084a9e;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
  margin-right: 10px;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.8);
}

.logout-btn {
  display: flex !important;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #0a5bc4 !important;
  color: white !important;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s ease;
  white-space: nowrap;
}

.logout-btn:hover {
  background: #084a9e !important;
}

.logout-btn .icon {
  width: 16px;
  height: 16px;
  display: inline-block;
}

.logout-btn .label {
  font-size: 14px;
  display: inline-block;
}

/* Tablettes et petits écrans */
@media (max-width: 992px) {
  .app-header__inner {
    padding: 0 16px;
  }
  
  .menu-link {
    padding: 6px 12px;
    font-size: 13px;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .app-header__inner { 
    padding: 0 12px; 
    height: 70px; 
    flex-wrap: wrap;
  }
  
  .left {
    gap: 0;
  }
  
  .ministry-title {
    font-size: 13px;
  }
  
  .republic-text {
    font-size: 11px;
  }
  
  .flag-strip {
    max-width: 150px;
    height: 6px;
  }
  
  .center {
    order: 3;
    width: 100%;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .header-menu {
    gap: 4px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .menu-link {
    padding: 6px 10px;
    font-size: 12px;
  }
  
  .right {
    margin-left: auto;
  }
  
  .btn-primary,
  .btn-secondary {
    padding: 8px 14px;
    font-size: 13px;
  }
  
  .logout-btn {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .logout-btn .label {
    display: none;
  }
  
  .sidebar-toggle-btn-fixed {
    top: 6px;
    left: 6px;
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}

/* Très petits écrans */
@media (max-width: 480px) {
  .app-header__inner {
    height: auto;
    min-height: 70px;
    padding: 10px 10px 12px;
  }
  
  .ministry-title {
    font-size: 11px;
  }
  
  .republic-text {
    font-size: 10px;
  }
  
  .flag-strip {
    max-width: 100px;
    height: 5px;
  }
  
  .menu-link {
    padding: 5px 8px;
    font-size: 11px;
  }
  
  .btn-secondary {
    margin-right: 6px;
    padding: 6px 10px;
    font-size: 12px;
  }
  
  .btn-primary {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>
