<template>
  <transition name="slide-down">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">

        <h3 class="title">
          {{ isEdit ? "Modifier l’unité" : "Nouvelle unité" }}
        </h3>

        <form @submit.prevent="submit">
          <div class="form-group">
            <label class="form-label">Nom de l'unité *</label>
            <input
              v-model="form.nom"
              placeholder="Nom de l'unité"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Type d'unité</label>
            <input
              v-model="form.reference"
              placeholder="Type d'unité"
            />
          </div>

          <div v-if="!isPointFocal" class="form-group">
            <label class="form-label">Département *</label>
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
          </div>

          <div v-if="isPointFocal" class="form-group info-box">
            <small>Cette unité sera automatiquement rattachée à votre département.</small>
          </div>

          <div class="form-group">
            <label class="form-label">Adresse</label>
            <input
              v-model="form.adresse"
              placeholder="Adresse"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Contact</label>
            <input
              v-model="form.contact"
              placeholder="Contact"
            />
          </div>

          <div class="actions">
            <button type="button" class="cancel" @click="$emit('close')">
              Annuler
            </button>

            <button type="submit" class="primary">
              Enregistrer
            </button>
          </div>
        </form>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, computed, watch, onMounted } from "vue";

/* PROPS */
const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  departements: {
    type: Array,
    default: () => []
  },
  isPointFocal: {
    type: Boolean,
    default: false
  },
  departementId: {
    type: Number,
    default: null
  }
});

/* DEBUG */
onMounted(() => {
  console.log("UniteModal - Départements reçus:", props.departements);
});

const emit = defineEmits(["save", "close"]);

/* FORM */
const form = reactive({
  nom: "",
  reference: "",
  departement_id: "",
  adresse: "",
  contact: ""
});

/* EDIT MODE */
const isEdit = computed(() => !!props.modelValue?.id);

/* WATCH MODEL */
watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      Object.assign(form, {
        nom: v.nom || "",
        reference: v.reference || "",
        departement_id: v.departement_id || (props.isPointFocal && props.departementId ? props.departementId : ""),
        adresse: v.adresse || "",
        contact: v.contact || ""
      });
    } else {
      // Nouvelle unité : initialiser avec le departement_id du point focal si disponible
      Object.assign(form, {
        nom: "",
        reference: "",
        departement_id: props.isPointFocal && props.departementId ? props.departementId : "",
        adresse: "",
        contact: ""
      });
    }
  },
  { immediate: true }
);

// Initialiser le département si c'est un point focal
watch(
  () => props.departementId,
  (newId) => {
    if (props.isPointFocal && newId) {
      form.departement_id = newId;
    }
  },
  { immediate: true }
);

/* SUBMIT */
function submit() {
  // Pour un point focal, utiliser automatiquement son département (même si pas dans le formulaire)
  const dataToSave = {
    ...form,
    id: props.modelValue?.id
  };

  // Si c'est un point focal, utiliser automatiquement son département
  if (props.isPointFocal) {
    // Utiliser le departementId de la prop si disponible
    if (props.departementId) {
      dataToSave.departement_id = props.departementId;
    }
    // Pour un point focal, on ne vérifie pas departement_id car le backend le gère automatiquement
  }

  // Vérifier que le nom est fourni
  if (!dataToSave.nom) {
    alert("Le nom de l'unité est obligatoire");
    return;
  }

  // Pour les admins, vérifier que le département est fourni
  if (!props.isPointFocal && !dataToSave.departement_id) {
    alert("Le département est obligatoire");
    return;
  }

  emit("save", dataToSave);
}
</script>

<style scoped>
/* BACKDROP */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* MODAL */
.modal {
  background: #fff;
  width: 480px;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,.15);
  font-family: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* TITLE */
.title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  text-align: center;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.3px;
}

/* FORM GROUP */
.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  font-family: 'Inter', sans-serif;
}

/* INPUTS */
input,
select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

input:focus,
select:focus {
  outline: none;
  border-color: #0a5bc4;
  box-shadow: 0 0 0 3px rgba(10, 91, 196, 0.1);
}

input::placeholder {
  color: #94a3b8;
}

.info-box {
  background: #e0f2fe;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
}

.info-box small {
  color: #0369a1;
  font-size: 13px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}

/* ACTIONS */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  color: #475569;
  transition: all 0.3s ease;
}

.cancel:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.primary {
  background: linear-gradient(135deg, #0a5bc4 0%, #09315c 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(10, 91, 196, 0.2);
}

.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(10, 91, 196, 0.3);
}

/* ANIMATION */
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
