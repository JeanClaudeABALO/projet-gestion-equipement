<template>
  <div
    v-if="sidebarOpen && isMobile"
    class="sidebar-overlay"
    @click="toggleSidebar"
    aria-hidden="true"
  ></div>
  <aside class="sidebar" :class="{ 'sidebar-collapsed': !sidebarOpen }">
    <div class="sidebar-header">
      <h2>Point Focal</h2>
    </div>

    <nav class="menu">
      <ul>
        <li @click="goAndClose('/dashboard-point-focal')" class="menu-item">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="label">Tableau de bord</span>
        </li>

        <li @click="goAndClose('/equipements')" class="menu-item">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <span class="label">Équipements</span>
        </li>

        <li @click="goAndClose('/dashboard-point-focal/unites')" class="menu-item">
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

        <li @click="goAndClose('/dashboard-point-focal/reparations')" class="menu-item">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
          <span class="label">Réparations</span>
        </li>
      </ul>
    </nav>

    <div class="sidebar-actions">
      <button @click="goBackAndClose" class="action-btn back-btn">
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
import { useSidebarPointFocal } from "../scripts/SidebarPointFocal.js";

const {
  sidebarOpen,
  toggleSidebar,
  isMobile,
  goAndClose,
  goBackAndClose,
  logout
} = useSidebarPointFocal();
</script>
<style scoped src="../styles/SidebarPointFocal.css"></style>
