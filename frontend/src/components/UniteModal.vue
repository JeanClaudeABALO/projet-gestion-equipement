<template>
  <transition name="slide-down">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">

        <h3 class="title">
          {{ isEdit ? "Modifier l’unité" : "Nouvelle unité" }}
        </h3>

        <form @submit.prevent="submit">
          <input
            v-model="form.nom"
            placeholder="Nom de l'unité *"
            required
          />

          <input
            v-model="form.reference"
            placeholder="Référence"
          />

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

          <input
            v-model="form.adresse"
            placeholder="Adresse"
          />

          <input
            v-model="form.contact"
            placeholder="Contact"
          />

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
        departement_id: v.departement_id || "",
        adresse: v.adresse || "",
        contact: v.contact || ""
      });
    } else {
      Object.assign(form, {
        nom: "",
        reference: "",
        departement_id: "",
        adresse: "",
        contact: ""
      });
    }
  },
  { immediate: true }
);

/* SUBMIT */
function submit() {
  emit("save", {
    ...form,
    id: props.modelValue?.id
  });
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
  width: 440px;
  padding: 24px;
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(0,0,0,.15);
}

/* TITLE */
.title {
  margin-bottom: 18px;
  font-size: 18px;
  color: #073b75;
  text-align: center;
}

/* INPUTS */
input,
select {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
}

/* ACTIONS */
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
