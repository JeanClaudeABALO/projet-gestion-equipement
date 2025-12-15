<template>
  <div class="home-container">

    <AppHeader />

    <section class="intro">
      <p>
        Bienvenue sur la plateforme officielle de gestion des équipements.
        Choisissez votre type de compte pour continuer.
      </p>
    </section>

    <section class="role-buttons">
      <button class="role-btn admin" @click="goToLogin('admin')">Administrateur Central</button>
      <button class="role-btn pf" @click="goToLogin('pf')">Point Focal</button>
    </section>


  </div>
</template>

<script>
import AppHeader from "../components/AppHeader.vue";
import AppFooter from "../components/AppFooter.vue";

export default {
  name: "Home",
  components: { AppHeader, AppFooter },

  methods: {
    goToLogin(role) {
      this.$router.push({
        name: "login",
        query: { role: role }
      });
    }
  }
};
</script>

<style scoped>
.home-container {
  text-align: center;
  padding: 30px 20px;
  font-family: Arial, sans-serif;
}

.intro {
  margin: 30px auto;
  max-width: 500px;
  font-size: 16px;
  color: #555;
}

.role-buttons {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.role-btn {
  padding: 15px 25px;
  font-size: 18px;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-weight: bold;
  transition: 0.3s;
}

.role-btn.admin {
  background-color: #2c3e50;
  color: white;
}

.role-btn.pf {
  background-color: #3498db;
  color: white;
}

.role-btn:hover {
  transform: scale(1.05);
}
</style>
