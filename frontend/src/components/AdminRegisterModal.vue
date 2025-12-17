<template>
  <transition name="slide-down">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <h3 class="title">Inscription Administrateur Principal</h3>

        <p class="info-text">
          ⚠️ Cette inscription n'est disponible qu'une seule fois, lors de la première installation du système.
        </p>

        <form @submit.prevent="submit">
          <input
            v-model="form.nom"
            placeholder="Nom complet *"
            required
          />

          <input
            v-model="form.email"
            type="email"
            placeholder="Email *"
            required
          />

          <input
            v-model="form.password"
            type="password"
            placeholder="Mot de passe *"
            required
            minlength="8"
          />

          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirmer le mot de passe *"
            required
            minlength="8"
          />

          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="success" class="success">{{ success }}</p>

          <div class="actions">
            <button type="button" class="cancel" @click="$emit('close')">
              Annuler
            </button>
            <button type="submit" class="primary" :disabled="loading">
              {{ loading ? "Création..." : "Créer l'administrateur" }}
            </button>
          </div>
        </form>
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
      success.value = "Administrateur créé avec succès !";
      setTimeout(() => {
        emit("success");
      }, 1500);
    })
    .catch((err) => {
      error.value = err.response?.data?.message || "Erreur lors de la création de l'administrateur";
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
}

.modal {
  background: #fff;
  width: 500px;
  max-width: 90vw;
  padding: 24px;
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(0,0,0,.15);
}

.title {
  margin-bottom: 12px;
  font-size: 20px;
  color: #073b75;
  text-align: center;
}

.info-text {
  background: #fff3cd;
  color: #856404;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 20px;
  text-align: center;
}

input {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
  box-sizing: border-box;
}

.error {
  color: #dc3545;
  font-size: 13px;
  margin-bottom: 12px;
  text-align: center;
}

.success {
  color: #28a745;
  font-size: 13px;
  margin-bottom: 12px;
  text-align: center;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
}

.cancel {
  background: #eee;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.primary {
  background: #0a5bc4;
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  cursor: pointer;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

