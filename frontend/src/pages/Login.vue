<template>
  <div class="login">
    <h2>Connexion</h2>

    <div class="card">
      <!-- Sélection du rôle -->
      <label>Rôle :</label>
      <select v-model="selectedRole" required>
        <option value="">-- Choisir un rôle --</option>
        <option value="admin">Administrateur centrale</option>
        <option value="pf">Point Focal</option>
      </select>

      <!-- Email -->
      <label>Email</label>
      <input type="email" v-model="email" placeholder="Votre email" required>

      <!-- Mot de passe -->
      <label>Mot de passe</label>
      <input type="password" v-model="password" placeholder="Votre mot de passe" required>

      <button @click="login">Se connecter</button>

      <p class="error" v-if="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import api from "../api/axios";   // <-- TON axios configuré

export default {
  name: "Login",
  data() {
    return {
      selectedRole: "",    // <-- Ici se stocke le rôle choisi
      email: "",
      password: "",
      error: ""
    };
  },

  methods: {
    async login() {
      this.error = "";

      // Vérification rapide
      if (!this.selectedRole || !this.email || !this.password) {
        this.error = "Tous les champs sont obligatoires";
        return;
      }

      try {
        // 👉👉 C’EST ICI QUE TU METS LE PAYLOAD
        const payload = {
          email: this.email,
          password: this.password,
          role: this.selectedRole  // admin ou pf
        };

        // 👉👉 C’EST ICI L’APPEL AXIOS
        const res = await api.post("/auth/login", payload);

        // Stockage token
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", this.selectedRole);

        // Redirection
        this.$router.push("/dashboard");

      } catch (err) {
        this.error = err.response?.data?.message || "Erreur de connexion";
      }
    }
  }
};
</script>

<style scoped>
.login {
  width: 400px;
  margin: 50px auto;
}
.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>
