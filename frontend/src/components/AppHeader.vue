<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<template>
  <header class="app-header" role="banner">
    <!-- top row (logo + action) -->
    <div class="app-header__inner">
      <div class="left">
        <img src="/logo-benin.png" class="logo" alt="logo" />
        <div class="brand">
          <h1>Plateforme des Équipements</h1>
          <div class="tag">Ministère de la Santé – République du Bénin</div>
        </div>
      </div>

      <div class="right">
        <button class="login-btn" @click="router.push('/login')">Se connecter</button>
      </div>
    </div>

    <!-- nav row (full width background, centered content) -->
    <nav class="nav-bar" role="navigation">
      <div class="nav-inner">
        <ul class="menu">
          <li @click="router.push('/equipements')">Équipements</li>
          <li @click="router.push('/rechercher')">Rechercher un équipement</li>
          <li @click="router.push('/departements')">Équipements par département</li>
          <li @click="router.push('/unites')">Équipements par unité</li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<style>
/* FIXED header full width */
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: #073b75;
  border-bottom: 3px solid #f1c40f;
}

/* inner area (top row) - centered content */
.app-header__inner {
  max-width: 1200px;        /* center content inside full-width header */
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;             /* fixed top-row height */
  padding: 0 20px;
  box-sizing: border-box;
}

/* left area: logo + brand */
.left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
}
.brand h1 { margin: 0; color: #fff; font-size: 20px; }
.tag { font-size: 12px; color: rgba(255,255,255,0.9); }

/* right action */
.right { display: flex; align-items: center; gap: 12px; }
.login-btn {
  background: #0a5bc4;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}

/* NAV BAR: full width background; content centered with same max-width */
.nav-bar {
  width: 100%;
  background: #09315c;
}
.nav-inner {
  max-width: 1200px;        /* same centering width as top row */
  margin: 0 auto;
  padding: 0 20px;
  height: 55px;             /* fixed nav height */
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

/* MENU: force it to the RIGHT inside the centered container */
.menu {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  gap: 32px;
  margin-left: auto;        /* THIS forces menu to the right of the nav-inner */
  align-items: center;
}
.menu li {
  color: white;
  cursor: pointer;
  font-size: 15px;
  padding: 6px 2px;
}
.menu li:hover {
  color: #f1c40f;
  border-bottom: 2px solid #f1c40f;
  padding-bottom: 3px;
}

/* small screens: collapse spacing */
@media (max-width: 768px) {
  .app-header__inner { padding: 0 12px; height: 64px; }
  .nav-inner { padding: 0 12px; height: 48px; }
  .menu { gap: 14px; font-size: 14px; }
}
</style>
