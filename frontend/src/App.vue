<script setup>
import { ref, provide, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";

const MOBILE_BREAKPOINT = 768;

// État global de la sidebar
const sidebarOpen = ref(true);
const route = useRoute();
const isMobile = ref(false);

function checkMobile() {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
  if (isMobile.value) {
    sidebarOpen.value = false;
  } else {
    sidebarOpen.value = true;
  }
}

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

// Footer masqué sur toutes les pages avec sidebar (espace connecté)
const showFooter = computed(() => {
  const path = route.path;
  const hasSidebar =
    path.startsWith("/dashboard") ||
    path.startsWith("/dashboard-point-focal") ||
    path === "/departements" ||
    path === "/unites" ||
    path === "/reparations" ||
    path === "/equipements" ||
    path === "/utilisateurs";
  return !hasSidebar && path !== "/login" && path !== "/change-password";
});

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

// Fournir l'état aux composants enfants
provide("sidebarOpen", sidebarOpen);
provide("toggleSidebar", toggleSidebar);
provide("isMobile", isMobile);
provide("MOBILE_BREAKPOINT", MOBILE_BREAKPOINT);
</script>

<template>
  <div id="app">
    <AppHeader />

    <!-- main-content est la zone principale; la classe est celle du css global -->
    <main class="main-content">
      <router-view />
    </main>

    <AppFooter v-if="showFooter" />
  </div>
</template>

<style>
/* rien à ajouter ici : layout géré par main.css */
</style>
