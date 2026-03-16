<template>
  <header class="app-header" :class="{ 'has-sidebar-toggle': isAuthenticated && isMobile }" role="banner">
    <div class="app-header__inner">
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

      <div class="right">
        <button v-if="!isAuthenticated" class="btn-secondary" @click="router.push('/login')">
          Connexion
        </button>
        <button v-if="!isAuthenticated" class="btn-primary" @click="goToPlatform()">
          Accès plateforme
        </button>
        <button v-else class="logout-btn" @click="logout">
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

  <button
    v-if="isAuthenticated"
    class="sidebar-toggle-btn-fixed"
    @click="toggleSidebar"
    :title="sidebarOpen ? 'Masquer le menu' : 'Afficher le menu'"
  >
    <span class="icon">☰</span>
  </button>
</template>

<script setup>
import { useAppHeader } from "../scripts/AppHeader.js";

const {
  router,
  sidebarOpen,
  toggleSidebar,
  isMobile,
  isAuthenticated,
  menuItems,
  isActive,
  logout,
  goToPlatform
} = useAppHeader();
</script>
<style src="../styles/AppHeader.css"></style>
