<template>
  <aside class="sidebar" :class="{ 'sidebar-collapsed': !sidebarOpen }">
    <div class="sidebar-header">
      <h2>Administration</h2>
    </div>

    <nav class="menu">
      <ul>
        <li class="menu-item" @click="go('/dashboard/admin')">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="label">Tableau de bord</span>
        </li>

        <li class="menu-item" @click="go('/departements')">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="label">Départements</span>
        </li>

        <li class="menu-item" @click="go('/unites')">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18"></path>
            <path d="M5 21V7l8-4v18"></path>
            <path d="M19 21V11l-6-4"></path>
            <line x1="9" y1="9" x2="9" y2="9"></line>
            <line x1="9" y1="12" x2="9" y2="12"></line>
            <line x1="9" y1="15" x2="9" y2="15"></line>
            <line x1="9" y1="18" x2="9" y2="18"></line>
          </svg>
          <span class="label">Unités</span>
        </li>

        <li class="menu-item" @click="go('/equipements')">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <span class="label">Équipements</span>
        </li>

        <li class="menu-item" @click="go('/utilisateurs')">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span class="label">Utilisateurs</span>
        </li>

        <li class="menu-item" @click="go('/reparations')">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
          <span class="label">Réparations</span>
        </li>
      </ul>
    </nav>

    <div class="sidebar-actions">
      <button @click="goBack" class="action-btn back-btn">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span class="label">Retour</span>
      </button>
      
      <button @click="logout" class="action-btn logout-btn">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span class="label">Déconnexion</span>
      </button>
    </div>

    <div class="sidebar-footer">
      <small>© 2025 – Plateforme de Gestion</small>
    </div>
  </aside>
</template>

<script setup>
import { inject, ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Injecter l'état de la sidebar
const sidebarOpen = inject('sidebarOpen', ref(true));
const toggleSidebar = inject('toggleSidebar', () => {});

// Récupérer le rôle de l'utilisateur
const userRole = ref(localStorage.getItem("role"));
const isSuperAdmin = computed(() => userRole.value === "super_admin");

function go(path) {
  router.push(path);
}

function goBack() {
  router.go(-1);
}

function logout() {
  if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
    // Supprimer les données du localStorage immédiatement
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    
    // Déclencher un événement personnalisé pour notifier les autres composants
    window.dispatchEvent(new Event('storage'));
    
    // Utiliser le router Vue pour une redirection instantanée
    router.replace("/");
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 220px;
  height: 100vh;
  background: linear-gradient(180deg, #0a5bc4 0%, #073b75 100%);
  color: white;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: transform 0.3s ease;
}

.sidebar-collapsed {
  transform: translateX(-100%);
}

/* Mobile : sidebar en overlay */
@media (max-width: 768px) {
  .sidebar {
    width: 260px;
    box-shadow: 8px 0 30px rgba(0, 0, 0, 0.3);
  }
  
  .sidebar-collapsed {
    transform: translateX(-100%);
  }
}

/* Header */
.sidebar-header {
  padding: 24px 20px;
  text-align: center;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 20px;
  letter-spacing: 0.5px;
  font-weight: 700;
}

/* Menu */
.menu {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 4px 12px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.menu-item.active {
  background: rgba(255, 255, 255, 0.2);
  border-left: 4px solid #fbbf24;
}

.menu-item .icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.menu-item .label {
  font-size: 15px;
  font-weight: 500;
}

/* Sidebar Actions */
.sidebar-actions {
  padding: 16px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(0, 0, 0, 0.1);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  width: 100%;
  justify-content: flex-start;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-2px);
}

.logout-btn {
  background: rgba(220, 38, 38, 0.2);
  color: #fecaca;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.logout-btn:hover {
  background: rgba(220, 38, 38, 0.3);
  color: white;
  transform: translateX(-2px);
}

.action-btn .icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.action-btn .label {
  font-size: 15px;
  font-weight: 600;
}

/* Footer */
.sidebar-footer {
  padding: 16px;
  font-size: 11px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.1);
}
</style>
