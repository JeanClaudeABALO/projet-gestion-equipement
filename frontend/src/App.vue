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

<script setup>
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import { useAppSetup } from "./scripts/App.js";

const { showFooter } = useAppSetup();
</script>
<style src="./styles/App.css"></style>
