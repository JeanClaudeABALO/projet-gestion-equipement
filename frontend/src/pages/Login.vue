<template>
  <div class="login-page">
    <!-- SECTION 1: EN-TÊTE INSTITUTIONNEL -->
    <header class="login-header">
      <div class="header-content">
        <img src="/logo-benin.png" alt="Logo Bénin" class="header-logo" />
        <div class="header-text">
          <h1 class="platform-name">Plateforme nationale de gestion des équipements</h1>
          <p class="ministry-name">CDSP – République du Bénin</p>
        </div>
      </div>
    </header>

    <!-- SECTION 2: CARTE DE CONNEXION -->
    <main class="login-main">
      <div class="login-card">
        <div class="card-header">
          <h2 class="card-title">Connexion à la plateforme</h2>
          <p class="card-subtitle">Accès réservé aux utilisateurs autorisés</p>
        </div>

        <form @submit.prevent="login" class="login-form">
          <!-- Email -->
          <div class="form-group">
            <label class="form-label">
              Email / Identifiant
            </label>
            <div class="email-input-wrapper">
              <input 
                type="email" 
                v-model="email" 
                class="form-input form-input-with-icon"
                placeholder="votre.email@exemple.com" 
                required
              >
              <svg class="user-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="5"></circle>
                <path d="M20 21a8 8 0 0 0-16 0"></path>
              </svg>
            </div>
          </div>

          <!-- Mot de passe -->
          <div class="form-group">
            <label class="form-label">
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
                <svg v-if="showPassword" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
                <svg v-else class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>

          <!-- Message d'erreur -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <!-- Bouton de connexion -->
          <button type="submit" class="login-button" :disabled="loading">
            <span v-if="!loading">
              Se connecter
            </span>
            <span v-else class="loading-text">Connexion en cours...</span>
          </button>

          <!-- Message important -->
          <div class="info-message">
            <p>L'inscription des utilisateurs est réservée à l'administrateur principal.</p>
          </div>
        </form>

        <!-- SECTION 3: AIDE & CONTEXTE -->
        <div class="help-section">
          <a href="/contact" class="help-link">
            Contacter l'administrateur
          </a>
          <a href="/" class="help-link">
            Retour à l'accueil
          </a>
        </div>
      </div>
    </main>

    <!-- SECTION 4: FOOTER DISCRET -->
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
  background: linear-gradient(135deg, #f6f8fc 0%, #e8f0f8 100%);
  font-family: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* SECTION 1: EN-TÊTE INSTITUTIONNEL */
.login-header {
  background: #073b75;
  color: white;
  padding: 30px 20px;
  border-bottom: 3px solid #f1c40f;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.header-logo {
  width: 70px;
  height: 70px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.15);
  padding: 8px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.header-text {
  text-align: center;
}

.platform-name {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
}

.ministry-name {
  font-size: 16px;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

/* SECTION 2: CARTE DE CONNEXION */
.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  max-width: 550px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.login-card:hover {
  box-shadow: 
    0 15px 50px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.05);
}

.card-header {
  text-align: center;
  margin-bottom: 24px;
}

.card-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 26px;
  font-weight: 700;
  color: #073b75;
  margin: 0 0 6px 0;
}

.card-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* FORMULAIRE */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
}

.label-icon {
  font-size: 16px;
}

.form-input,
select.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #fff;
  color: #2d3748;
  box-sizing: border-box;
  font-family: inherit;
}

.form-input:focus,
select.form-input:focus {
  outline: none;
  border-color: #073b75;
  box-shadow: 0 0 0 3px rgba(7, 59, 117, 0.1);
}

.form-input::placeholder {
  color: #a0aec0;
}

select.form-input {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23073b75' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
}

/* Wrapper email avec icône */
.email-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.email-input-wrapper .user-icon {
  position: absolute;
  right: 16px;
  width: 20px;
  height: 20px;
  color: #718096;
  pointer-events: none;
  z-index: 1;
  transition: color 0.3s ease;
}

.form-input-with-icon {
  padding-right: 48px !important;
}

.form-input-with-icon:focus ~ .user-icon,
.email-input-wrapper:focus-within .user-icon {
  color: #073b75;
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
  color: #073b75;
}

.password-toggle .icon {
  width: 20px;
  height: 20px;
}

/* Message d'erreur */
.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fed7d7;
  border: 1px solid #fc8181;
  border-radius: 10px;
  color: #c53030;
  font-size: 14px;
}

.error-icon {
  font-size: 18px;
  flex-shrink: 0;
}

/* Bouton de connexion */
.login-button {
  width: 100%;
  padding: 16px;
  background: #073b75;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(7, 59, 117, 0.3);
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-button:hover:not(:disabled) {
  background: #052649;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(7, 59, 117, 0.4);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.button-icon {
  font-size: 18px;
}

.loading-text {
  display: inline-block;
}

/* Message important */
.info-message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 10px;
  margin-top: 8px;
}

.info-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-message p {
  margin: 0;
  font-size: 13px;
  color: #856404;
  line-height: 1.5;
}

/* SECTION 3: AIDE & CONTEXTE */
.help-section {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 12px;
}

.help-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #718096;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.help-link:hover {
  color: #073b75;
}

.help-icon {
  font-size: 16px;
}

/* SECTION 4: FOOTER DISCRET */
.login-footer {
  background: #052649;
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

/* RESPONSIVE */
@media (max-width: 768px) {
  .login-header {
    padding: 20px 15px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .header-logo {
    width: 60px;
    height: 60px;
  }

  .platform-name {
    font-size: 18px;
  }

  .ministry-name {
    font-size: 14px;
  }

  .login-card {
    padding: 30px 24px;
  }

  .card-title {
    font-size: 24px;
  }

  .help-section {
    flex-direction: column;
    align-items: center;
  }
}
</style>
