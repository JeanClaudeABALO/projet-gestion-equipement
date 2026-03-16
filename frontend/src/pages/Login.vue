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

<script setup>
import { useLogin } from "../scripts/pages/Login.js";

const {
  email,
  password,
  error,
  showPassword,
  loading,
  currentYear,
  togglePassword,
  login
} = useLogin();
</script>
<style scoped src="../styles/pages/Login.css"></style>
