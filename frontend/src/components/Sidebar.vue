<template>
  <div class="sidebar">
    <h3>GESTION ÉQUIPEMENTS</h3>

    <ul>
      <li><router-link to="/dashboard">Dashboard</router-link></li>
      <li><router-link to="/unites">Unités</router-link></li>
      <li><router-link to="/equipements">Équipements</router-link></li>
      <li><router-link to="/mouvements">Mouvements</router-link></li>
      <li><router-link to="/reparations">Réparations</router-link></li>
      <li><router-link to="/utilisateurs">Utilisateurs</router-link></li>
    </ul>
  </div>
</template>

<style>
.sidebar { width: 250px; background: #222; color: #fff; height: 100vh; padding: 20px; }
.sidebar ul { list-style: none; padding: 0; }
.sidebar li { margin: 15px 0; }
.sidebar a { color: white; text-decoration: none; }
</style>
