<template>
  <transition name="slide-down">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <h3 class="title">
          {{ isEdit ? "Modifier l'équipement" : "Nouvel équipement" }}
        </h3>

        <form @submit.prevent="submit">
          <!-- Unité -->
          <div class="form-group" ref="uniteSelectRef">
            <label class="form-label">Unité *</label>
            <div class="searchable-select" :class="{ open: uniteDropdownOpen }">
              <div
                class="select-trigger"
                @click="uniteDropdownOpen = !uniteDropdownOpen"
              >
                <span v-if="selectedUniteNom" class="selected-value">{{ selectedUniteNom }}</span>
                <span v-else class="placeholder">-- Sélectionner une unité --</span>
                <svg class="chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div v-if="uniteDropdownOpen" class="select-dropdown">
                <div class="search-input-wrapper">
                  <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    ref="uniteSearchInputRef"
                    v-model="uniteSearchQuery"
                    type="text"
                    class="search-input"
                    placeholder="Rechercher une unité..."
                    @click.stop
                  />
                </div>
                <div class="options-list">
                  <div
                    v-for="u in filteredUnitesForSelect"
                    :key="u.id"
                    class="option-item"
                    :class="{ selected: form.unite_id == u.id }"
                    @click="selectUnite(u)"
                  >
                    {{ u.nom }}{{ !isPointFocal && u.departement_nom ? ` (${u.departement_nom})` : '' }}
                  </div>
                  <div v-if="filteredUnitesForSelect.length === 0" class="option-empty">
                    Aucune unité trouvée
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Type d'équipement -->
          <div class="form-group">
            <label class="form-label">Type d'équipement *</label>
            <select v-model="form.type_id" required @change="handleTypeChange">
              <option value="">-- Sélectionner un type --</option>
              <option
                v-for="t in types"
                :key="t.id"
                :value="t.id"
              >
                {{ t.nom }}
              </option>
              <option value="new_type">Autres type</option>
            </select>
          </div>

          <!-- Champ pour nouveau type -->
          <div v-if="showNewTypeField" class="form-group">
            <label class="form-label">Nouveau type d'équipement *</label>
            <div class="new-type-input-group">
              <input
                v-model="newTypeName"
                type="text"
                placeholder="Entrez le nom du nouveau type"
                required
                @blur="validateNewType"
              />
              <button 
                type="button" 
                class="btn-add-type" 
                @click="addNewType"
                :disabled="!newTypeName || newTypeName.trim() === '' || addingType"
              >
                <svg v-if="!addingType" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span v-else class="loading-spinner"></span>
              </button>
            </div>
            <small v-if="newTypeError" class="error-message">{{ newTypeError }}</small>
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
import { reactive, computed, watch, ref, onMounted, onUnmounted, nextTick } from "vue";
import typesApi from "../api/equipementsTypes";

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
  },
  isPointFocal: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["save", "close", "type-added"]);

const form = reactive({
  unite_id: "",
  type_id: "",
  quantite: 1,
  etat: "fonctionnel",
  commentaire: ""
});

const isEdit = computed(() => !!props.modelValue?.id);

const uniteSearchQuery = ref("");
const uniteDropdownOpen = ref(false);
const uniteSelectRef = ref(null);
const uniteSearchInputRef = ref(null);

const filteredUnitesForSelect = computed(() => {
  const q = uniteSearchQuery.value.trim().toLowerCase();
  if (!q) return props.unites;
  return props.unites.filter((u) =>
    (u.nom || "").toLowerCase().includes(q) ||
    (u.departement_nom || "").toLowerCase().includes(q)
  );
});

const selectedUniteNom = computed(() => {
  if (!form.unite_id) return "";
  const u = props.unites.find((u) => u.id == form.unite_id);
  return u ? `${u.nom}${!props.isPointFocal && u.departement_nom ? ` (${u.departement_nom})` : ""}` : "";
});

function selectUnite(u) {
  form.unite_id = u.id;
  uniteDropdownOpen.value = false;
  uniteSearchQuery.value = "";
}

// Fermer le dropdown au clic extérieur
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
function handleClickOutside(e) {
  if (uniteSelectRef.value && !uniteSelectRef.value.contains(e.target)) {
    uniteDropdownOpen.value = false;
  }
}

const showNewTypeField = computed(() => form.type_id === "new_type");
const newTypeName = ref("");
const newTypeError = ref("");
const addingType = ref(false);

watch(uniteDropdownOpen, (open) => {
  if (open) {
    uniteSearchQuery.value = "";
    nextTick(() => uniteSearchInputRef.value?.focus());
  }
});

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
    // Réinitialiser le champ nouveau type et la recherche unité
    newTypeName.value = "";
    newTypeError.value = "";
    uniteSearchQuery.value = "";
    uniteDropdownOpen.value = false;
  },
  { immediate: true }
);

function updateDepartement() {
  // Cette fonction peut être utilisée pour mettre à jour d'autres champs si nécessaire
}

function handleTypeChange() {
  if (form.type_id !== "new_type") {
    newTypeName.value = "";
    newTypeError.value = "";
  }
}

function validateNewType() {
  if (showNewTypeField.value && newTypeName.value.trim() === "") {
    newTypeError.value = "Le nom du type est obligatoire";
  } else {
    newTypeError.value = "";
  }
}

async function addNewType() {
  if (!newTypeName.value || newTypeName.value.trim() === "") {
    newTypeError.value = "Le nom du type est obligatoire";
    return;
  }

  // Vérifier si le type existe déjà
  const typeExists = props.types.some(
    t => t.nom.toLowerCase().trim() === newTypeName.value.toLowerCase().trim()
  );

  if (typeExists) {
    newTypeError.value = "Ce type d'équipement existe déjà";
    return;
  }

  addingType.value = true;
  newTypeError.value = "";

  try {
    const response = await typesApi.create({
      nom: newTypeName.value.trim(),
      description: null
    });

    // Le backend retourne { message, id } dans response.data
    const newTypeId = response.data.id || response.data.insertId;
    
    // Émettre l'événement pour mettre à jour la liste des types dans le parent
    emit("type-added", {
      id: newTypeId,
      nom: newTypeName.value.trim(),
      description: null
    });

    // Sélectionner automatiquement le nouveau type
    form.type_id = newTypeId;
    newTypeName.value = "";
  } catch (error) {
    console.error("Erreur lors de l'ajout du type:", error);
    newTypeError.value = error.response?.data?.message || "Erreur lors de l'ajout du type";
  } finally {
    addingType.value = false;
  }
}

function submit() {
  if (!form.unite_id) {
    uniteDropdownOpen.value = true;
    return;
  }
  if (form.type_id === "new_type") {
    newTypeError.value = "Veuillez d'abord ajouter le nouveau type";
    return;
  }

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
  width: 580px;
  max-width: 90vw;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,.15);
  max-height: 90vh;
  overflow-y: auto;
  font-family: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
}

.title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  text-align: center;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.3px;
}

.form-group {
  margin-bottom: 16px;
  position: relative;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  font-family: 'Inter', sans-serif;
}

input,
select,
textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

textarea {
  resize: vertical;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #1a6fd4;
  box-shadow: 0 0 0 3px rgba(26, 111, 212, 0.1);
}

input::placeholder,
textarea::placeholder {
  color: #94a3b8;
}

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
  background: linear-gradient(135deg, #1a6fd4 0%, #0f4a7a 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(26, 111, 212, 0.2);
}

.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(26, 111, 212, 0.3);
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

.new-type-input-group {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.new-type-input-group input {
  flex: 1;
}

.btn-add-type {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 48px;
  height: 44px;
  box-sizing: border-box;
}

.btn-add-type:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.btn-add-type:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
}

.btn-add-type svg {
  width: 20px;
  height: 20px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  display: block;
  margin-top: 6px;
  color: #ef4444;
  font-size: 12px;
  font-weight: 500;
}

/* Searchable select */
.searchable-select {
  position: relative;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  background: white;
  cursor: pointer;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
  min-height: 44px;
  box-sizing: border-box;
}

.select-trigger:hover {
  border-color: #cbd5e1;
}

.searchable-select.open .select-trigger {
  border-color: #1a6fd4;
  box-shadow: 0 0 0 3px rgba(26, 111, 212, 0.1);
}

.selected-value {
  color: #1a202c;
  font-weight: 500;
}

.placeholder {
  color: #94a3b8;
}

.chevron {
  width: 18px;
  height: 18px;
  color: #64748b;
  flex-shrink: 0;
  margin-left: 8px;
  transition: transform 0.2s ease;
}

.searchable-select.open .chevron {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  z-index: 10;
  overflow: hidden;
}

.search-input-wrapper {
  position: relative;
  padding: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input-wrapper .search-input {
  padding: 10px 14px 10px 44px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}

.search-input-wrapper .search-input:focus {
  outline: none;
  border-color: #1a6fd4;
}

.options-list {
  max-height: 200px;
  overflow-y: auto;
  padding: 4px;
}

.option-item {
  padding: 10px 14px;
  cursor: pointer;
  font-size: 14px;
  color: #334155;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.option-item:hover {
  background: #f1f5f9;
}

.option-item.selected {
  background: rgba(26, 111, 212, 0.1);
  color: #1a6fd4;
  font-weight: 600;
}

.option-empty {
  padding: 16px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
}
</style>

