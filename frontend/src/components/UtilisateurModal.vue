<template>
  <transition name="slide-down">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <h3 class="title">
          {{ isEdit ? "Modifier l'utilisateur" : "Nouveau Point Focal" }}
        </h3>

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
            :placeholder="isEdit ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'"
            :required="!isEdit"
          />

          <input
            v-model="form.telephone"
            placeholder="Téléphone"
          />

          <!-- Sélection du département (obligatoire pour PF) -->
          <select v-model="form.departement_id" required>
            <option value="">-- Sélectionner un département --</option>
            <option
              v-for="d in departements"
              :key="d.id"
              :value="d.id"
            >
              {{ d.nom }}
            </option>
            <option v-if="departements.length === 0" disabled>
              Aucun département disponible
            </option>
          </select>

          <div class="info-box">
            <small>ℹ️ Seuls les Points Focaux peuvent être créés depuis cette interface.</small>
          </div>

          <div class="actions">
            <button type="button" class="cancel" @click="$emit('close')">
              Annuler
            </button>
            <button type="submit" class="primary">
              {{ isEdit ? "Modifier" : "Créer" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, computed, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  departements: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["save", "close"]);

const form = reactive({
  nom: "",
  email: "",
  password: "",
  telephone: "",
  departement_id: "",
  role_id: null // Sera défini à 2 (PF) lors de la soumission
});

const isEdit = computed(() => !!props.modelValue?.id);

// Récupérer l'ID du rôle PF depuis l'API ou le définir à 2 (selon votre schéma)
// Pour l'instant, on le définira côté backend, mais on peut aussi le faire ici
watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      Object.assign(form, {
        nom: v.nom || "",
        email: v.email || "",
        password: "", // Ne pas pré-remplir le mot de passe
        telephone: v.telephone || "",
        departement_id: v.departement_id || "",
        role_id: v.role_id || null
      });
    } else {
      Object.assign(form, {
        nom: "",
        email: "",
        password: "",
        telephone: "",
        departement_id: "",
        role_id: null
      });
    }
  },
  { immediate: true }
);

function submit() {
  // Le backend déterminera le role_id (2 pour PF)
  // On envoie juste les données, le backend s'assurera qu'on ne crée pas d'admin
  emit("save", {
    ...form,
    id: props.modelValue?.id,
    // Le role_id sera géré par le backend (toujours PF = 2)
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
  margin-bottom: 18px;
  font-size: 18px;
  color: #073b75;
  text-align: center;
}

input,
select {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
  box-sizing: border-box;
}

.info-box {
  background: #e0f2fe;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.info-box small {
  color: #0369a1;
  font-size: 12px;
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

