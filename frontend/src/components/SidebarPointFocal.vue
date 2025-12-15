<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>Point Focal</h2>
    </div>

    <nav class="menu">
      <ul>
        <li @click="go('/dashboard-point-focal')">
          <span class="icon">🏠</span>
          <span class="label">Tableau de bord</span>
        </li>

        <li @click="go('/unites')">
          <span class="icon">🏥</span>
          <span class="label">Unités</span>
        </li>

        <li @click="go('/equipements')">
          <span class="icon">📦</span>
          <span class="label">Équipements</span>
        </li>

        <li @click="go('/reparations')">
          <span class="icon">🛠</span>
          <span class="label">Réparations</span>
        </li>

        <li @click="go('/notifications')">
          <span class="icon">🔔</span>
          <span class="label">Notifications</span>
        </li>

        <li @click="go('/logs')">
          <span class="icon">🕒</span>
          <span class="label">Dernières modifications</span>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <small>© 2025 – Ministère de la Santé</small>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

function go(path) {
  router.push(path);
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background: linear-gradient(180deg, #073b75, #052b55);
  color: white;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

/* Header */
.sidebar-header {
  padding: 20px;
  text-align: center;
  font-weight: bold;
  border-bottom: 1px solid rgba(255,255,255,0.15);
}

.pf-content {
  margin-left: 240px; /* largeur exacte de la sidebar */
}


.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
}

/* Menu */
.menu {
  flex: 1;
  padding-top: 10px;
}

.menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.menu li:hover {
  background: rgba(255,255,255,0.12);
}

.icon {
  font-size: 18px;
}

.label {
  font-size: 14px;
}

/* Footer */
.sidebar-footer {
  padding: 15px;
  font-size: 11px;
  text-align: center;
  border-top: 1px solid rgba(255,255,255,0.15);
}
</style>
