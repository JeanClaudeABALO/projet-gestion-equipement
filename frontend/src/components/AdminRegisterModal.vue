<template>
  <transition name="slide-down">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <!-- Panneau gauche : gradient bleu -->
        <div class="modal-panel-left">
          <div class="panel-left-curve"></div>
          <div class="panel-left-content">
            <h1 class="welcome-title">Inscription</h1>
            <p class="welcome-subtitle">
              Créez le compte Super Administrateur. Cette action n'est disponible qu'une seule fois lors de la première installation.
            </p>
            <button type="button" class="sign-in-outline" @click="$emit('close')">
              Annuler
            </button>
          </div>
        </div>

        <!-- Panneau droit : formulaire -->
        <div class="modal-panel-right">
          <h2 class="panel-right-title">Administrateur Principal</h2>
          <p class="panel-right-subtitle">Remplissez les informations pour créer le compte</p>

          <form @submit.prevent="submit" class="register-form">
            <div class="form-group">
              <input
                v-model="form.nom"
                class="form-input"
                placeholder="Nom complet *"
                required
              />
            </div>
            <div class="form-group">
              <input
                v-model="form.email"
                type="email"
                class="form-input"
                placeholder="Email *"
                required
              />
            </div>
            <div class="form-group">
              <div class="password-input-wrapper">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Mot de passe *"
                  required
                  minlength="8"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Masquer' : 'Afficher'"
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
            <div class="form-group">
              <div class="password-input-wrapper">
                <input
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Confirmer le mot de passe *"
                  required
                  minlength="8"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showConfirmPassword = !showConfirmPassword"
                  :aria-label="showConfirmPassword ? 'Masquer' : 'Afficher'"
                >
                  <svg v-if="showConfirmPassword" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
            <div v-if="success" class="success-message">{{ success }}</div>

            <button type="submit" class="sign-up-btn" :disabled="loading">
              {{ loading ? "Création en cours..." : "Créer l'administrateur" }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, ref } from "vue";
import authApi from "../api/auth";

const emit = defineEmits(["close", "success"]);

const form = reactive({
  nom: "",
  email: "",
  password: "",
  confirmPassword: ""
});

const error = ref("");
const success = ref("");
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

function submit() {
  error.value = "";
  success.value = "";

  // Validation
  if (form.password !== form.confirmPassword) {
    error.value = "Les mots de passe ne correspondent pas";
    return;
  }

  if (form.password.length < 8) {
    error.value = "Le mot de passe doit contenir au moins 8 caractères";
    return;
  }

  loading.value = true;

  authApi.registerAdmin({
    nom: form.nom,
    email: form.email,
    password: form.password
  })
    .then(() => {
      loading.value = false;
      success.value = "Administrateur créé avec succès !";
      setTimeout(() => {
        emit("success");
      }, 1500);
    })
    .catch((err) => {
      console.error("Erreur inscription super admin:", err);
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error?.message ||
                         err.message || 
                         "Erreur lors de la création du super administrateur";
      error.value = errorMessage;
      loading.value = false;
    });
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
}

.modal {
  display: flex;
  width: 100%;
  max-width: 900px;
  min-height: 500px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

/* Panneau gauche : gradient bleu */
.modal-panel-left {
  flex: 1;
  min-width: 280px;
  background: linear-gradient(135deg, #052649 0%, #073b75 50%, #0a5bc4 100%);
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
  background: linear-gradient(135deg, #073b75 0%, #0a5bc4 100%);
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
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.sign-in-outline:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Panneau droit : formulaire */
.modal-panel-right {
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
  margin: 0 0 28px 0;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
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
  border-color: #073b75;
  background: white;
  box-shadow: 0 0 0 3px rgba(7, 59, 117, 0.1);
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
  color: #073b75;
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

.success-message {
  padding: 12px 16px;
  background: #c6f6d5;
  border: 1px solid #68d391;
  border-radius: 12px;
  color: #276749;
  font-size: 14px;
}

.sign-up-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #073b75 0%, #052649 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 4px;
}

.sign-up-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #052649 0%, #031d3a 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(7, 59, 117, 0.35);
}

.sign-up-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 768px) {
  .modal {
    flex-direction: column;
    max-width: 420px;
    min-height: auto;
  }

  .modal-panel-left {
    min-height: 200px;
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

  .modal-panel-right {
    padding: 32px 24px;
  }

  .panel-right-title {
    font-size: 22px;
  }
}

.slide-down-enter-active {
  animation: slideDown 0.35s ease-out;
}
.slide-down-leave-active {
  animation: slideUp 0.25s ease-in;
}

@keyframes slideDown {
  from {
    transform: translateY(-60px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-40px);
    opacity: 0;
  }
}
</style>

