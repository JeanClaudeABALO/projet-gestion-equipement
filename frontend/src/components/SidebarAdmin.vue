<template>
  <aside class="sidebar">
    <h2 class="sidebar-title">Administration</h2>

    <ul class="menu">
      <li class="menu-item active">
        <span class="icon">📦</span>
        <span>Équipements</span>
      </li>

      <li class="menu-item">
        <span class="icon">🏥</span>
        <span>Unités</span>
      </li>

      <li class="menu-item">
        <span class="icon">🏛️</span>
        <span>Départements</span>
      </li>

      <li class="menu-item">
        <span class="icon">🔔</span>
        <span>Notifications</span>
      </li>

      <li class="menu-item">
        <span class="icon">🕒</span>
        <span>Dernières modifications</span>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background: linear-gradient(180deg, #073b75, #052b52);
  color: white;
  padding: 20px 0;
  box-sizing: border-box;
}

/* titre */
.sidebar-title {
  text-align: center;
  font-size: 18px;
  margin-bottom: 30px;
  font-weight: bold;
}

/* menu vertical */
.menu {
  list-style: none;
  padding: 0;
  margin: 0;

  display: flex;
  flex-direction: column; /* 🔑 LE POINT CLÉ */
  gap: 8px;
}

/* item */
.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 15px;
}

/* hover */
.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* actif */
.menu-item.active {
  background-color: rgba(241, 196, 15, 0.2);
  border-left: 4px solid #f1c40f;
}

/* icône */
.icon {
  font-size: 18px;
}
</style>
