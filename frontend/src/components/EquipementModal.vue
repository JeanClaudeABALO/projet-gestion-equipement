<template>
  <transition name="slide-down">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <h3 class="title">
          {{ isEdit ? "Modifier l'équipement" : "Nouvel équipement" }}
        </h3>

        <form @submit.prevent="submit">
          <!-- Unité -->
          <div class="form-group">
            <label class="form-label">Unité *</label>
            <select v-model="form.unite_id" required @change="updateDepartement">
              <option value="">-- Sélectionner une unité --</option>
              <option
                v-for="u in unites"
                :key="u.id"
                :value="u.id"
              >
                {{ u.nom }} ({{ u.departement_nom }})
              </option>
            </select>
          </div>

          <!-- Type d'équipement -->
          <div class="form-group">
            <label class="form-label">Type d'équipement *</label>
            <select v-model="form.type_id" required>
              <option value="">-- Sélectionner un type --</option>
              <option
                v-for="t in types"
                :key="t.id"
                :value="t.id"
              >
                {{ t.nom }}
              </option>
            </select>
          </div>

          <!-- Quantité -->
          <div class="form-group">
            <label class="form-label">Quantité *</label>
            <input
              v-model.number="form.quantite"
              type="number"
              min="1"
              placeholder="Quantité"
              required
            />
          </div>

          <!-- État -->
          <div class="form-group">
            <label class="form-label">État *</label>
            <select v-model="form.etat" required>
              <option value="fonctionnel">Fonctionnel</option>
              <option value="non_fonctionnel">Non fonctionnel</option>
              <option value="reparation">En réparation</option>
              <option value="manquant">Manquant</option>
              <option value="vetuste">Vétuste</option>
            </select>
          </div>

          <!-- Commentaire -->
          <div class="form-group">
            <label class="form-label">Commentaire</label>
            <textarea
              v-model="form.commentaire"
              placeholder="Commentaire ou notes..."
              rows="3"
            ></textarea>
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
  unites: {
    type: Array,
    default: () => []
  },
  types: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["save", "close"]);

const form = reactive({
  unite_id: "",
  type_id: "",
  quantite: 1,
  etat: "fonctionnel",
  commentaire: ""
});

const isEdit = computed(() => !!props.modelValue?.id);

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      Object.assign(form, {
        unite_id: v.unite_id || "",
        type_id: v.type_id || "",
        quantite: v.quantite || 1,
        etat: v.etat || "fonctionnel",
        commentaire: v.commentaire || ""
      });
    } else {
      Object.assign(form, {
        unite_id: "",
        type_id: "",
        quantite: 1,
        etat: "fonctionnel",
        commentaire: ""
      });
    }
  },
  { immediate: true }
);

function updateDepartement() {
  // Cette fonction peut être utilisée pour mettre à jour d'autres champs si nécessaire
}

function submit() {
  emit("save", {
    ...form,
    id: props.modelValue?.id
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
  width: 550px;
  max-width: 90vw;
  padding: 24px;
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(0,0,0,.15);
  max-height: 90vh;
  overflow-y: auto;
}

.title {
  margin-bottom: 18px;
  font-size: 18px;
  color: #073b75;
  text-align: center;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;
}

textarea {
  resize: vertical;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #0a5bc4;
  box-shadow: 0 0 0 3px rgba(10, 91, 196, 0.1);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
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

