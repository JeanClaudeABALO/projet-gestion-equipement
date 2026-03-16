<template>
  <div class="login-page">
    <main class="login-main">
      <div class="login-card">
        <!-- Panneau gauche : Bienvenue (gradient bleu) -->
        <div class="login-panel-left">
          <div class="panel-left-curve"></div>
          <div class="panel-left-content">
            <h1 class="welcome-title">Bienvenue !</h1>
            <p class="welcome-subtitle">
              Entrez vos identifiants pour accéder à toutes les fonctionnalités de la plateforme CDSP
            </p>
            <a href="/" class="sign-in-outline">Retour à l'accueil</a>
          </div>
        </div>

        <!-- Panneau droit : Formulaire de connexion -->
        <div class="login-panel-right">
          <h2 class="panel-right-title">Connexion</h2>
          <p class="panel-right-subtitle">Accès réservé aux utilisateurs autorisés</p>

          <form @submit.prevent="login" class="login-form">
            <div class="form-group">
              <input 
                type="email" 
                v-model="email" 
                class="form-input"
                placeholder="Email / Identifiant" 
                required
              >
            </div>
            <div class="form-group">
              <div class="password-input-wrapper">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  v-model="password" 
                  class="form-input"
                  placeholder="Mot de passe" 
                  required
                >
                <button 
                  type="button" 
                  class="password-toggle" 
                  @click="togglePassword"
                  :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                >
                  <svg v-if="showPassword" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                  <svg v-else class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="error" class="error-message">{{ error }}</div>

            <button type="submit" class="sign-up-btn" :disabled="loading">
              <span v-if="!loading">Se connecter</span>
              <span v-else class="loading-text">Connexion en cours...</span>
            </button>
          </form>

          <div class="help-section">
            <a href="/contact" class="help-link">Contacter l'administrateur</a>
          </div>
        </div>
      </div>
    </main>

    <footer class="login-footer">
      <p>© {{ currentYear }} – CDSP – République du Bénin</p>
      <p class="footer-subtitle">Plateforme interne – Accès sécurisé</p>
    </footer>
  </div>
</template>

<script>
import api from "../api/axios";

export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
      error: "",
      showPassword: false,
      loading: false,
      currentYear: new Date().getFullYear()
    };
  },

  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },

    async login() {
      this.error = "";
      this.loading = true;

      if (!this.email || !this.password) {
        this.error = "Email et mot de passe sont obligatoires";
        this.loading = false;
        return;
      }

      try {
        const payload = {
          email: this.email,
          password: this.password
        };

        const res = await api.post("/auth/login", payload);

        // Vérifier si un changement de mot de passe est forcé
        if (res.data.forcePasswordChange) {
          this.loading = false;
          // Stocker userId et le flag dans sessionStorage
          sessionStorage.setItem("userId", res.data.userId);
          sessionStorage.setItem("forcedChange", "true");
          // Rediriger vers la page de changement de mot de passe
          this.$router.push({
            path: "/change-password",
            query: { userId: res.data.userId, forced: "true" }
          });
          return;
        }

        if (!res.data.token || !res.data.role) {
          this.error = "Données de connexion incomplètes reçues du serveur";
          this.loading = false;
          return;
        }

        // Stocker le token et le rôle détecté automatiquement
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);

        this.loading = false;

        // Rediriger selon le rôle détecté automatiquement
        const detectedRole = res.data.role;
        if (detectedRole === "super_admin" || detectedRole === "admin") {
          this.$router.push("/dashboard/admin");
        } else if (detectedRole === "pf") {
          this.$router.push("/dashboard-point-focal");
        } else {
          this.error = "Rôle non reconnu. Veuillez contacter l'administrateur.";
        }

      } catch (err) {
        console.error("Erreur de connexion:", err);
        
        if (err.response) {
          this.error = err.response.data?.message || "Erreur de connexion";
        } else if (err.request) {
          this.error = "Impossible de contacter le serveur. Vérifiez que le backend est démarré.";
        } else {
          this.error = err.message || "Erreur de connexion";
        }
        
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #e8eef5 0%, #d4e1f0 100%);
  font-family: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
}

.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

/* Carte principale : deux panneaux côte à côte */
.login-card {
  display: flex;
  width: 100%;
  max-width: 900px;
  min-height: 500px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* Panneau gauche : gradient bleu */
.login-panel-left {
  flex: 1;
  min-width: 280px;
  background: linear-gradient(135deg, #0f3d6e 0%, #1a5a9e 50%, #1a6fd4 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
}

.panel-left-curve {
  position: absolute;
  top: -20%;
  right: -15%;
  width: 50%;
  height: 140%;
  background: linear-gradient(135deg, #1a5a9e 0%, #1a6fd4 100%);
  border-radius: 50%;
  opacity: 0.4;
}

.panel-left-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: white;
}

.welcome-subtitle {
  font-size: 15px;
  line-height: 1.6;
  opacity: 0.95;
  margin: 0 0 32px 0;
  max-width: 260px;
}

.sign-in-outline {
  display: inline-block;
  padding: 12px 32px;
  border: 2px solid white;
  border-radius: 12px;
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.sign-in-outline:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Panneau droit : formulaire */
.login-panel-right {
  flex: 1;
  min-width: 280px;
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
}

.panel-right-title {
  font-size: 26px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.panel-right-subtitle {
  font-size: 14px;
  color: #718096;
  margin: 0 0 32px 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-input {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s ease;
  background: #f7fafc;
  color: #2d3748;
  box-sizing: border-box;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #1a5a9e;
  background: white;
  box-shadow: 0 0 0 3px rgba(26, 90, 158, 0.1);
}

.form-input::placeholder {
  color: #a0aec0;
}

.password-input-wrapper {
  position: relative;
}

.password-input-wrapper .form-input {
  padding-right: 48px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #718096;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #1a5a9e;
}

.password-toggle .icon {
  width: 20px;
  height: 20px;
}

.error-message {
  padding: 12px 16px;
  background: #fed7d7;
  border: 1px solid #fc8181;
  border-radius: 12px;
  color: #c53030;
  font-size: 14px;
}

.sign-up-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #1a5a9e 0%, #0f3d6e 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.sign-up-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0f3d6e 0%, #0f2d52 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(26, 90, 158, 0.35);
}

.sign-up-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-text {
  display: inline-block;
}

.help-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.help-link {
  color: #718096;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.help-link:hover {
  color: #1a5a9e;
}

.login-footer {
  background: #0f3d6e;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  padding: 20px;
  font-size: 13px;
}

.login-footer p {
  margin: 4px 0;
}

.footer-subtitle {
  font-size: 12px;
  opacity: 0.7;
}

/* Responsive : empiler les panneaux sur mobile */
@media (max-width: 768px) {
  .login-card {
    flex-direction: column;
    max-width: 420px;
    min-height: auto;
  }

  .login-panel-left {
    min-height: 220px;
    padding: 32px 24px;
  }

  .panel-left-curve {
    display: none;
  }

  .welcome-title {
    font-size: 26px;
  }

  .welcome-subtitle {
    font-size: 14px;
    margin-bottom: 24px;
  }

  .login-panel-right {
    padding: 32px 24px;
  }

  .panel-right-title {
    font-size: 22px;
  }
}
</style>
