<template>
  <div class="login-container">
    <div class="background-animation"></div>
    
    <div class="login-wrapper">
      <div class="login-card">
        <!-- Header -->
        <div class="card-header">
          <div class="logo-icon">🔐</div>
          <h2 class="card-title">Connexion</h2>
          <p class="card-subtitle">Accédez à votre espace de gestion</p>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="login" class="login-form">
          <!-- Sélection du rôle -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">👤</span>
              Rôle
            </label>
            <select 
              v-model="selectedRole" 
              class="form-input"
              required
            >
              <option value="">-- Choisir un rôle --</option>
              <option value="admin">Administrateur Central</option>
              <option value="pf">Point Focal</option>
            </select>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">📧</span>
              Email
            </label>
            <input 
              type="email" 
              v-model="email" 
              class="form-input"
              placeholder="votre.email@exemple.com" 
              required
            >
          </div>

          <!-- Mot de passe -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🔑</span>
              Mot de passe
            </label>
            <div class="password-input-wrapper">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                class="form-input"
                placeholder="Votre mot de passe" 
                required
              >
              <button 
                type="button" 
                class="password-toggle" 
                @click="togglePassword"
                :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              >
                <span v-if="showPassword" class="icon">👁️</span>
                <span v-else class="icon">👁️‍🗨️</span>
              </button>
            </div>
          </div>

          <!-- Message d'erreur -->
          <div v-if="error" class="error-message">
            <span class="error-icon">⚠️</span>
            {{ error }}
          </div>

          <!-- Bouton de connexion -->
          <button type="submit" class="login-button" :disabled="loading">
            <span v-if="!loading">Se connecter</span>
            <span v-else class="loading-spinner">Connexion...</span>
          </button>

          <!-- Lien retour -->
          <div class="back-link">
            <a href="/" class="back-link-text">
              ← Retour à l'accueil
            </a>
          </div>
        </form>
      </div>
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
      error: "",
      showPassword: false,  // <-- État pour afficher/masquer le mot de passe
      loading: false
    };
  },

  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },

    async login() {
      this.error = "";
      this.loading = true;

      // Vérification rapide
      if (!this.selectedRole || !this.email || !this.password) {
        this.error = "Tous les champs sont obligatoires";
        this.loading = false;
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

        // Redirection selon le rôle
        if (this.selectedRole === "admin") {
          this.$router.push("/dashboard/admin");
        } else if (this.selectedRole === "pf") {
          this.$router.push("/dashboard-point-focal");
        } else {
          this.$router.push("/");
        }

      } catch (err) {
        this.error = err.response?.data?.message || "Erreur de connexion";
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* Container principal avec fond neutre */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20px;
  background: #f7fafc;
  overflow: hidden;
}

/* Animation de fond - désactivée */
.background-animation {
  display: none;
}

/* Wrapper pour centrer la carte */
.login-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 380px;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Carte de connexion */
.login-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.2);
}

/* Header de la carte */
.card-header {
  text-align: center;
  margin-bottom: 28px;
}

.logo-icon {
  font-size: 48px;
  margin-bottom: 12px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.card-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.card-subtitle {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

/* Formulaire */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.label-icon {
  font-size: 16px;
}

.form-input,
select.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #fff;
  color: #2d3748;
  box-sizing: border-box;
}

.form-input:focus,
select.form-input:focus {
  outline: none;
  border-color: #0a5bc4;
  box-shadow: 0 0 0 3px rgba(10, 91, 196, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: #a0aec0;
}

select.form-input {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230a5bc4' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
}

/* Wrapper mot de passe */
.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper .form-input {
  padding-right: 50px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: #718096;
}

.password-toggle:hover {
  background: #f7fafc;
  color: #0a5bc4;
  transform: scale(1.1);
}

.password-toggle:active {
  transform: scale(0.95);
}

.password-toggle .icon {
  font-size: 20px;
}

/* Message d'erreur */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fed7d7;
  border: 1px solid #fc8181;
  border-radius: 12px;
  color: #c53030;
  font-size: 14px;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.error-icon {
  font-size: 18px;
}

/* Bouton de connexion */
.login-button {
  width: 100%;
  padding: 14px;
  background: #0a5bc4;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(10, 91, 196, 0.3);
  margin-top: 6px;
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-button:hover::before {
  left: 100%;
}

.login-button:hover {
  background: #09315c;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(10, 91, 196, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  display: inline-block;
}

.loading-spinner::after {
  content: '...';
  animation: dots 1.5s steps(4, end) infinite;
}

@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}

/* Lien retour */
.back-link {
  text-align: center;
  margin-top: 8px;
}

.back-link-text {
  color: #718096;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.back-link-text:hover {
  color: #0a5bc4;
}

/* Responsive */
@media (max-width: 480px) {
  .login-card {
    padding: 30px 24px;
  }

  .card-title {
    font-size: 28px;
  }

  .logo-icon {
    font-size: 48px;
  }
}
</style>
