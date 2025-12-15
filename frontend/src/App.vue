<script setup>
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
</script>

<template>
  <div id="app">
    <AppHeader />

    <!-- main-content est la zone principale; la classe est celle du css global -->
    <main class="main-content">
      <router-view />
    </main>

    <AppFooter />
  </div>
</template>

<style>
/* rien à ajouter ici : layout géré par main.css */
</style>
