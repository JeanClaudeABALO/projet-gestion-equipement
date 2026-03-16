<template>
  <div class="modal-overlay">
    <div class="modal">
      <h3>{{ isEdit ? "Modifier département" : "Nouveau département" }}</h3>

      <form @submit.prevent="submit">
        <div class="form-group">
          <label>Nom du département *</label>
          <input v-model="form.nom" type="text" required />
        </div>

        <div class="form-group">
          <label>Code</label>
          <input v-model="form.code" type="text" />
        </div>

        <div class="actions">
          <button type="button" @click="$emit('close')">Annuler</button>
          <button type="submit" class="primary">Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from "vue";

const props = defineProps({
  modelValue: Object
});

const emit = defineEmits(["save", "close"]);

const form = reactive({
  nom: "",
  code: ""
});

const isEdit = computed(() => !!props.modelValue?.id);

/* Pré-remplir si édition */
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      form.nom = val.nom || "";
      form.code = val.code || "";
    }
  },
  { immediate: true }
);

function submit() {
  emit("save", {
    id: props.modelValue?.id,
    nom: form.nom,
    code: form.code
  });
}
</script>


<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal {
  background: white;
  width: 420px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.25);
}

.form-group {
  margin-bottom: 12px;
}

label {
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

input {
  width: 100%;
  padding: 6px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.primary {
  background: #1a6fd4;
  color: white;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
}

</style>