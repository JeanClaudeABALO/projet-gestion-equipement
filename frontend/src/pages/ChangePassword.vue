<template>
  <div class="change-password-page">
    <div class="change-password-container">
      <div class="change-password-card">
        <div class="card-header">
          <h2 class="card-title">Changement de mot de passe requis</h2>
          <p class="card-subtitle">Vous devez définir un nouveau mot de passe pour continuer</p>
        </div>

        <form @submit.prevent="changePassword" class="password-form">
          <!-- Ancien mot de passe (seulement si pas un changement forcé) -->
          <div v-if="!isForcedChange" class="form-group">
            <label class="form-label">
              Ancien mot de passe
            </label>
            <div class="password-input-wrapper">
              <input 
                :type="showOldPassword ? 'text' : 'password'" 
                v-model="oldPassword" 
                class="form-input"
                placeholder="Votre ancien mot de passe" 
                required
              >
              <button 
                type="button" 
                class="password-toggle" 
                @click="showOldPassword = !showOldPassword"
              >
                <svg v-if="showOldPassword" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

          <!-- Nouveau mot de passe -->
          <div class="form-group">
            <label class="form-label">
              Nouveau mot de passe
            </label>
            <div class="password-input-wrapper">
              <input 
                :type="showNewPassword ? 'text' : 'password'" 
                v-model="newPassword" 
                class="form-input"
                placeholder="Votre nouveau mot de passe (min. 6 caractères)" 
                required
              >
              <button 
                type="button" 
                class="password-toggle" 
                @click="showNewPassword = !showNewPassword"
              >
                <svg v-if="showNewPassword" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

          <!-- Confirmation -->
          <div class="form-group">
            <label class="form-label">
              Confirmer le nouveau mot de passe
            </label>
            <div class="password-input-wrapper">
              <input 
                :type="showConfirmPassword ? 'text' : 'password'" 
                v-model="confirmPassword" 
                class="form-input"
                :class="{ 'error': passwordMismatch }"
                placeholder="Confirmez votre nouveau mot de passe" 
                required
              >
              <button 
                type="button" 
                class="password-toggle" 
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <svg v-if="showConfirmPassword" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
                <svg v-else class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
            <p v-if="passwordMismatch" class="error-text">Les mots de passe ne correspondent pas</p>
            <p v-if="passwordTooShort" class="error-text">Le mot de passe doit contenir au moins 6 caractères</p>
          </div>

          <!-- Message d'erreur -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <!-- Bouton -->
          <button 
            type="submit" 
            class="submit-button" 
            :disabled="loading || passwordMismatch || passwordTooShort"
          >
            <span v-if="!loading">
              Changer le mot de passe
            </span>
            <span v-else class="loading-text">Changement en cours...</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../api/axios";

export default {
  name: "ChangePassword",
  data() {
    return {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      error: "",
      loading: false,
      userId: null,
      isForcedChange: false
    };
  },
  computed: {
    passwordMismatch() {
      return this.newPassword && this.confirmPassword && this.newPassword !== this.confirmPassword;
    },
    passwordTooShort() {
      return this.newPassword && this.newPassword.length > 0 && this.newPassword.length < 6;
    }
  },
  mounted() {
    // Récupérer userId depuis l'URL ou le localStorage/sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    this.userId = urlParams.get('userId') || sessionStorage.getItem('userId');
    this.isForcedChange = urlParams.get('forced') === 'true' || sessionStorage.getItem('forcedChange') === 'true';
    
    if (!this.userId) {
      this.error = "Identifiant utilisateur manquant";
      // Rediriger vers login après 2 secondes
      setTimeout(() => {
        this.$router.push("/login");
      }, 2000);
    }
  },
  methods: {
    async changePassword() {
      this.error = "";
      this.loading = true;

      // Validation côté client
      if (!this.newPassword || !this.confirmPassword) {
        this.error = "Tous les champs sont obligatoires";
        this.loading = false;
        return;
      }

      if (this.passwordMismatch) {
        this.error = "Les mots de passe ne correspondent pas";
        this.loading = false;
        return;
      }

      if (this.passwordTooShort) {
        this.error = "Le mot de passe doit contenir au moins 6 caractères";
        this.loading = false;
        return;
      }

      try {
        const payload = {
          userId: parseInt(this.userId),
          newPassword: this.newPassword
        };

        // Ajouter l'ancien mot de passe seulement si ce n'est pas un changement forcé
        if (!this.isForcedChange && this.oldPassword) {
          payload.oldPassword = this.oldPassword;
        }

        const res = await api.post("/auth/change-password", payload);

        if (res.data.message) {
          // Afficher un message de succès
          alert("Mot de passe changé avec succès ! Vous allez être redirigé vers la page de connexion.");
          
          // Nettoyer le sessionStorage
          sessionStorage.removeItem('userId');
          sessionStorage.removeItem('forcedChange');
          
          // Rediriger vers login
          this.$router.push("/login");
        }
      } catch (err) {
        console.error("Erreur lors du changement de mot de passe:", err);
        
        if (err.response) {
          this.error = err.response.data?.message || "Erreur lors du changement de mot de passe";
        } else if (err.request) {
          this.error = "Impossible de contacter le serveur. Vérifiez que le backend est démarré.";
        } else {
          this.error = err.message || "Erreur lors du changement de mot de passe";
        }
        
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.change-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f6f8fc 0%, #e8f0f8 100%);
  padding: 40px 20px;
  font-family: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
}

.change-password-container {
  width: 100%;
  max-width: 550px;
}

.change-password-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.change-password-card:hover {
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

.password-form {
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

.form-input {
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

.form-input:focus {
  outline: none;
  border-color: #073b75;
  box-shadow: 0 0 0 3px rgba(7, 59, 117, 0.1);
}

.form-input.error {
  border-color: #fc8181;
}

.error-text {
  color: #c53030;
  font-size: 13px;
  margin-top: 4px;
}

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

.submit-button {
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

.submit-button:hover:not(:disabled) {
  background: #052649;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(7, 59, 117, 0.4);
}

.submit-button:disabled {
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

@media (max-width: 768px) {
  .change-password-card {
    padding: 30px 24px;
  }

  .card-title {
    font-size: 24px;
  }
}
</style>

