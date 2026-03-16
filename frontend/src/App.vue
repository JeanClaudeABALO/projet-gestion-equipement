<script setup>
import { ref, provide, computed } from "vue";
import { useRoute } from "vue-router";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";

// État global de la sidebar
const sidebarOpen = ref(true);
const route = useRoute();

const showFooter = computed(() => {
  const path = route.path;
  return !path.startsWith("/dashboard") && !path.startsWith("/dashboard-point-focal");
});

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

// Fournir l'état aux composants enfants
provide('sidebarOpen', sidebarOpen);
provide('toggleSidebar', toggleSidebar);
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
